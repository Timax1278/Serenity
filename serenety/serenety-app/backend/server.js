// BACKEND (Express.js)
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

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

// Initialize data store
dataStore.load().catch(err => {
  console.error('Failed to initialize data store:', err);
  process.exit(1);
});

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

    // Log what was extracted
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
    const newUser = await dataStore.insert('users', { name, email, password });
    
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
    headers: req.headers
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

// Start the server with improved logging for GitHub Codespaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  
  // Detect if running in GitHub Codespaces
  const codespaceUrl = process.env.CODESPACE_NAME 
    ? `https://${process.env.CODESPACE_NAME}-${port}.app.github.dev` 
    : null;
  
  if (codespaceUrl) {
    console.log(`Running in GitHub Codespaces`);
    console.log(`Access your API at: ${codespaceUrl}`);
  } else {
    console.log(`Access your API at: http://localhost:${port}`);
  }
  
  console.log('API endpoints:');
  console.log('  GET  /api/status      - Check API status');
  console.log('  GET  /api/users       - Get all users');
  console.log('  POST /api/users       - Register a new user');
  console.log('  GET  /api/users/:id   - Get user by ID');
  console.log('  POST /api/login       - Login with email and password');
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Server shutting down...');
  await dataStore.save();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dataStore.save().then(() => {
    process.exit(1);
  });
});