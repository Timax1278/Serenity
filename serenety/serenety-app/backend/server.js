const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const http = require('http');
const WebSocket = require('ws');

// Initialize Express app first
const app = express();
const port = process.env.PORT || 5000;

// Now create the HTTP server using the app
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Track connected clients
const clients = new Set();

// Track visitor count
let visitorCount = 0;

// Google OAuth client - Usa la variabile d'ambiente o un valore predefinito per test
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR-CLIENT-ID-HERE.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Setup middleware
app.use(express.json());

// Configure CORS to accept requests from any origin in development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));

// Create a simple data store
const dataStore = {
  data: {},
  
  async load() {
    try {
      const filePath = path.join(__dirname, 'data.json');
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      
      if (fileExists) {
        const data = await fs.readFile(filePath, 'utf8');
        this.data = JSON.parse(data);
        console.log('Data loaded from file');
      } else {
        console.log('No existing data file, creating a new one');
        this.data = { users: [] };
        await this.save();
      }
    } catch (error) {
      console.log('Error reading file, starting with empty data store:', error.message);
      this.data = { users: [] };
      await this.save();
    }
  },
  
  async save() {
    try {
      const filePath = path.join(__dirname, 'data.json');
      await fs.writeFile(filePath, JSON.stringify(this.data, null, 2));
      console.log('Data saved to file');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },
  
  getCollection(collection) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    return this.data[collection];
  },
  
  async insert(collection, document) {
    const documents = this.getCollection(collection);
    document._id = Date.now().toString();
    documents.push(document);
    console.log(`Added document to ${collection}:`, document);
    console.log(`Collection now has ${documents.length} items`);
    await this.save();
    return document;
  },
  
  async find(collection, query = {}) {
    const documents = this.getCollection(collection);
    if (Object.keys(query).length === 0) {
      return documents;
    }
    return documents.filter(doc => {
      return Object.keys(query).every(key => doc[key] === query[key]);
    });
  },
  
  async findOne(collection, query) {
    const results = await this.find(collection, query);
    return results[0] || null;
  },
  
  async update(collection, query, update) {
    const documents = this.getCollection(collection);
    let count = 0;
    
    for (let i = 0; i < documents.length; i++) {
      if (Object.keys(query).every(key => documents[i][key] === query[key])) {
        documents[i] = { ...documents[i], ...update };
        count++;
      }
    }
    
    await this.save();
    return { modifiedCount: count };
  },
  
  async delete(collection, query) {
    const documents = this.getCollection(collection);
    const initialLength = documents.length;
    
    this.data[collection] = documents.filter(doc => {
      return !Object.keys(query).every(key => doc[key] === query[key]);
    });
    
    await this.save();
    return { deletedCount: initialLength - this.data[collection].length };
  }
};

// Broadcast visitor count to all clients
function broadcastVisitorCount() {
  const message = JSON.stringify({
    type: 'visitor_count',
    count: visitorCount
  });
  
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  clients.add(ws);
  visitorCount++;
  console.log(`New client connected. Total visitors: ${visitorCount}`);
  
  // Broadcast updated count to all clients
  broadcastVisitorCount();
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      // Convert Buffer to string if necessary
      const messageStr = message.toString();
      const data = JSON.parse(messageStr);
      console.log('Received message:', data);
      
      // Handle specific message types if needed
      if (data.type === 'join_visitor_counter') {
        console.log('Client joined visitor counter');
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    clients.delete(ws);
    visitorCount = Math.max(0, visitorCount - 1);
    console.log(`Client disconnected. Total visitors: ${visitorCount}`);
    
    // Broadcast updated count to all clients
    broadcastVisitorCount();
  });
});

// Crea un admin di default se non esiste
async function createDefaultAdmin() {
  try {
    const adminExists = await dataStore.findOne('users', { isAdmin: true });
    
    if (!adminExists) {
      console.log('Creating default admin account');
      await dataStore.insert('users', {
        name: 'Administrator',
        email: 'admin@example.com',
        password: 'admin123', // Cambia questa password in produzione!
        isAdmin: true,
        authProvider: 'local',
        createdAt: new Date().toISOString()
      });
      console.log('Default admin created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

// Initialize data store and create default admin
dataStore.load()
  .then(() => createDefaultAdmin())
  .catch(err => {
    console.error('Failed to initialize data store:', err);
    process.exit(1);
  });

// Funzione per verificare il token Google
async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    return {
      googleId: payload['sub'],
      email: payload['email'],
      name: payload['name'],
      picture: payload['picture'],
      verified: payload['email_verified']
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
}

// Middleware per verificare se l'utente è admin
function requireAdmin(req, res, next) {
  if (!req.body.adminToken) {
    return res.status(401).json({ message: 'Admin authentication required' });
  }
  
  // Verifica il token admin (in questo esempio semplice, verifichiamo solo l'email e la password)
  dataStore.findOne('users', { 
    email: req.body.adminEmail,
    password: req.body.adminPassword,
    isAdmin: true 
  })
    .then(admin => {
      if (!admin) {
        return res.status(403).json({ message: 'Admin access denied' });
      }
      req.admin = admin;
      next();
    })
    .catch(error => {
      console.error('Admin authentication error:', error);
      res.status(500).json({ message: 'Server error during admin authentication' });
    });
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    message: 'Welcome to the Serenity API'
  });
});

// API status route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// User routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await dataStore.find('users');
    // Remove passwords from response
    const safeUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// User registration route with detailed logging
app.post('/api/users', async (req, res) => {
  try {
    console.log("Received registration data:", req.body);
    
    const { name, email, password } = req.body;

    console.log("Extracted fields:", { 
      name: name || 'missing', 
      email: email || 'missing', 
      password: password ? 'provided' : 'missing' 
    });

    // Validate required fields
    if (!name || !email || !password) {
      console.log("Validation failed, missing fields");
      return res.status(400).json({ 
        message: 'Name, Email, and Password are required',
        missing: {
          name: !name,
          email: !email,
          password: !password
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Check if the email is already registered
    const existingUser = await dataStore.findOne('users', { email });
    if (existingUser) {
      console.log("Email already exists:", email);
      return res.status(400).json({ 
        message: 'Registration failed. Email already exists.' 
      });
    }

    // Insert the new user
    console.log("Creating new user with:", { name, email, password: "***" });
    const newUser = await dataStore.insert('users', { 
      name, 
      email, 
      password,
      isAdmin: false, // Default to non-admin
      authProvider: 'local',
      createdAt: new Date().toISOString()
    });
    
    // Don't send the password back in the response
    const { password: _, ...userWithoutPassword } = newUser;
    console.log("User created successfully:", userWithoutPassword);
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await dataStore.findOne('users', { _id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Debug route
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    headers: req.headers,
    googleClientId: GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'
  });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await dataStore.findOne('users', { email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Don't send the password back in the response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google Authentication endpoint
app.post('/api/google-auth', async (req, res) => {
  try {
    console.log("Received Google auth data:", req.body);
    
    const { googleId, email, name, picture, idToken } = req.body;
    
    if (!email || !googleId) {
      return res.status(400).json({ 
        message: 'Email and Google ID are required'
      });
    }
    
    // Verify the token if provided
    if (idToken) {
      try {
        await verifyGoogleToken(idToken);
      } catch (error) {
        return res.status(401).json({ message: 'Invalid Google token' });
      }
    }
    
    // Check if user already exists
    let user = await dataStore.findOne('users', { email });
    
    if (user) {
      // Update existing user with Google info if not already set
      if (!user.googleId) {
        await dataStore.update('users', { _id: user._id }, { 
          googleId, 
          picture,
          authProvider: 'google'
        });
        
        // Get the updated user
        user = await dataStore.findOne('users', { _id: user._id });
      }
    } else {
      // Create a new user
      user = await dataStore.insert('users', {
        name,
        email,
        googleId,
        picture,
        isAdmin: false,
        authProvider: 'google',
        createdAt: new Date().toISOString()
      });
    }
    
    // Don't send the password back in the response
    const { password, ...userWithoutPassword } = user;
    
    console.log("Google authentication successful for:", email);
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ 
      message: 'Server error during Google authentication',
      error: error.message 
    });
  }
});

// Update user endpoint
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, currentPassword, newPassword } = req.body;
    
    // Find the user
    const user = await dataStore.findOne('users', { _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare update object
    const updateData = {};
    
    // Always allow name update
    if (name) {
      updateData.name = name;
    }
    
    // For local auth users, handle email and password changes
    if (user.authProvider === 'local') {
      // Email update
      if (email && email !== user.email) {
        // Check if the new email is already in use
        const existingUser = await dataStore.findOne('users', { email });
        if (existingUser && existingUser._id !== userId) {
          return res.status(400).json({ message: 'Email already in use by another account' });
        }
        updateData.email = email;
      }
      
      // Password update
      if (newPassword) {
        // Verify current password
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required to set a new password' });
        }
        
        if (user.password !== currentPassword) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        updateData.password = newPassword;
      }
    }
    
    // Update the user
    await dataStore.update('users', { _id: userId }, updateData);
    
    // Get the updated user
    const updatedUser = await dataStore.findOne('users', { _id: userId });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const admin = await dataStore.findOne('users', { 
      email,
      password,
      isAdmin: true
    });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    // Crea un token semplice (in produzione, usare JWT o simili)
    const adminToken = Buffer.from(`${email}:${password}:${Date.now()}`).toString('base64');
    
    res.json({
      message: 'Admin login successful',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin
      },
      adminToken
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// Endpoint per visualizzare tutti gli utenti (incluse le password)
app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await dataStore.find('users');
    res.json(users); // Include tutte le informazioni, comprese le password
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Endpoint per eliminare un utente
app.post('/api/admin/users/delete/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verifica che l'utente esista
    const user = await dataStore.findOne('users', { _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Non permettere di eliminare se stessi
    if (user._id === req.admin._id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }
    
    // Elimina l'utente
    const result = await dataStore.delete('users', { _id: userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found or could not be deleted' });
    }
    
    res.json({ 
      message: 'User deleted successfully',
      deletedUserId: userId
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Endpoint per creare un nuovo admin
app.post('/api/admin/create-admin', requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Verifica se l'email è già in uso
    const existingUser = await dataStore.findOne('users', { email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Crea il nuovo admin
    const newAdmin = await dataStore.insert('users', {
      name,
      email,
      password,
      isAdmin: true,
      authProvider: 'local',
      createdAt: new Date().toISOString()
    });
    
    // Rimuovi la password dalla risposta
    const { password: _, ...adminWithoutPassword } = newAdmin;
    
    res.status(201).json({
      message: 'Admin created successfully',
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// Google authentication endpoint (semplice - accetta dati dal client)
app.post('/api/google-auth-simple', async (req, res) => {
  try {
    const { googleId, email, name, picture, isRegistration } = req.body;
    
    console.log("Received Google auth data:", { 
      googleId: googleId ? "[PRESENT]" : "[MISSING]", 
      email, 
      name, 
      picture: picture ? "[PRESENT]" : "[MISSING]",
      isRegistration 
    });
    
    if (!googleId || !email || !name) {
      return res.status(400).json({ 
        message: 'GoogleId, Email, and Name are required for Google authentication'
      });
    }
    
    // Check if user exists
    let user = await dataStore.findOne('users', { email });
    
    // If user doesn't exist and this is a registration, create new user
    if (!user && isRegistration) {
      console.log("Creating new user with Google account:", { name, email, googleId });
      
      user = await dataStore.insert('users', {
        name,
        email,
        googleId,
        picture,
        isAdmin: false, // Default to non-admin for Google auth
        authProvider: 'google',
        createdAt: new Date().toISOString()
      });
      
      console.log("Google user created successfully:", user);
    }
    // If user doesn't exist and this is a login attempt
    else if (!user && !isRegistration) {
      return res.status(401).json({ 
        message: 'No account exists with this email. Please register first.'
      });
    }
    // If user exists but doesn't have googleId (user previously registered with email/password)
    else if (user && !user.googleId) {
      // Link the Google account to the existing user
      console.log("Linking Google account to existing user:", email);
      
      await dataStore.update('users', { email }, {
        googleId,
        picture: picture || user.picture,
        updatedAt: new Date().toISOString()
      });
      
      // Get the updated user
      user = await dataStore.findOne('users', { email });
    }
    // If user exists with googleId but it doesn't match (someone trying to use same email with different Google account)
    else if (user && user.googleId && user.googleId !== googleId) {
      return res.status(401).json({ 
        message: 'This email is already linked to a different Google account' 
      });
    }
    
    // Verify the user was found or created
    if (!user) {
      return res.status(500).json({ message: 'Failed to authenticate with Google' });
    }
    
    // Don't send any sensitive data back in the response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ 
      message: 'Server error during Google authentication',
      error: error.message 
    });
  }
});

// Google authentication with token verification (more secure)
app.post('/api/google-auth-secure', async (req, res) => {
  try {
    const { token, isRegistration } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }
    
    // Verify the token with Google
    let googleUser;
    try {
      googleUser = await verifyGoogleToken(token);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }
    
    if (!googleUser.verified) {
      return res.status(400).json({ message: 'Google email is not verified' });
    }
    
    const { googleId, email, name, picture } = googleUser;
    
    // Check if user exists
    let user = await dataStore.findOne('users', { email });
    
    // If user doesn't exist and this is a registration, create new user
    if (!user && isRegistration) {
      console.log("Creating new user with Google account:", { name, email, googleId });
      
      user = await dataStore.insert('users', {
        name,
        email,
        googleId,
        picture,
        isAdmin: false, // Default to non-admin for Google auth
        authProvider: 'google',
        createdAt: new Date().toISOString()
      });
      
      console.log("Google user created successfully:", user);
    }
    // If user doesn't exist and this is a login attempt
    else if (!user && !isRegistration) {
      return res.status(401).json({ 
        message: 'No account exists with this email. Please register first.'
      });
    }
    // If user exists but doesn't have googleId (user previously registered with email/password)
    else if (user && !user.googleId) {
      // Link the Google account to the existing user
      console.log("Linking Google account to existing user:", email);
      
      await dataStore.update('users', { email }, {
        googleId,
        picture: picture || user.picture,
        updatedAt: new Date().toISOString()
      });
      
      // Get the updated user
      user = await dataStore.findOne('users', { email });
    }
    // If user exists with googleId but it doesn't match (someone trying to use same email with different Google account)
    else if (user && user.googleId && user.googleId !== googleId) {
      return res.status(401).json({ 
        message: 'This email is already linked to a different Google account' 
      });
    }
    
    // Verify the user was found or created
    if (!user) {
      return res.status(500).json({ message: 'Failed to authenticate with Google' });
    }
    
    // Don't send any sensitive data back in the response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ 
      message: 'Server error during Google authentication',
      error: error.message 
    });
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`WebSocket server running on ws://localhost:${port}/ws`);
  console.log(`Default admin credentials: admin@example.com / admin123`);
  console.log(`WARNING: Change the default admin password in production!`);
});