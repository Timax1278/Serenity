// backend/server.js
// --- PRIMISSIMA RIGA DEVE ESSERE QUESTA ---
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
// ----------------------------------------

// --- LOG DI DEBUG DOTENV ---
console.log('------------------------------------');
console.log('[DEBUG DOTENV] Attempted to load .env from:', path.resolve(__dirname, '.env'));
const FREESOUND_API_KEY_FROM_ENV = process.env.FREESOUND_API_KEY;
console.log('[DEBUG DOTENV] Value for FREESOUND_API_KEY immediately after load:', FREESOUND_API_KEY_FROM_ENV ? '****** (Loaded)' : '<<<<< UNDEFINED or EMPTY >>>>>');
console.log('------------------------------------');
// -------------------------

// --- Altri Require ---
const express = require('express');
const fs = require('fs').promises;
// const path = require('path'); // Già importato
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
// ---------------------

const app = express();
const port = process.env.PORT || 5000; // Ora PORT può essere caricato da .env

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();
let visitorCount = 0;
const clientGroupSubscriptions = new Map();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR-CLIENT-ID-HERE.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const dataStore = {
  data: {},
  async load() {
    try {
      const filePath = path.join(__dirname, 'data.json');
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      if (fileExists) {
        const dataContent = await fs.readFile(filePath, 'utf8');
        this.data = JSON.parse(dataContent);
        console.log('Data loaded from file');
        if (!this.data.users) this.data.users = [];
        if (!this.data.groups) this.data.groups = [];
        if (!this.data.chatMessages) this.data.chatMessages = [];
        if (!this.data.meditations) this.data.meditations = []; // Per dati locali se servono
        if (!this.data.listenHistory) this.data.listenHistory = [];
      } else {
        console.log('No existing data file, creating a new one');
        this.data = { users: [], groups: [], chatMessages: [], meditations: [], listenHistory: [] };
        await this.save();
      }
    } catch (error) {
      console.error('Error reading data.json, starting with empty data store:', error.message);
      this.data = { users: [], groups: [], chatMessages: [], meditations: [], listenHistory: [] };
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

// server.js

// ... (altre parti del codice sopra) ...

// --- BLOCCO WEBSOCKET SERVER CORRETTO ---
wss.on('connection', (ws) => {
  // 1. Aggiungi il nuovo client al Set globale
  clients.add(ws);

  // 2. Gestisci il contatore visitatori (se vuoi)
  visitorCount++;
  console.log(`[WS CONNECT] New client connected. Total visitors: ${visitorCount}. Total connections: ${clients.size}`);

  // 3. Invia il conteggio attuale al NUOVO client
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'visitor_count', count: visitorCount }));
  }

  // 4. Invia il conteggio aggiornato a TUTTI i client (incluso il nuovo)
  broadcastVisitorCount(); // Funzione che invia { type: 'visitor_count', count: visitorCount } a tutti in 'clients'

  // 5. Definisci l'handler per i messaggi da QUESTO client
  ws.on('message', (message) => {
    try {
      const messageStr = message.toString();
      const data = JSON.parse(messageStr);
      console.log('[WS RECEIVED] Message from client:', data);

      if (data.type === 'subscribe_group' && data.groupId) {
        console.log(`[WS SUBSCRIBE] Client subscribing to group ${data.groupId}`);
        clientGroupSubscriptions.set(ws, data.groupId); // Associa il client al gruppo
        console.log('[WS SUB MAP after subscribe]', clientGroupSubscriptions); // Log mappa
      }
      else if (data.type === 'unsubscribe_group') {
         console.log(`[WS UNSUBSCRIBE] Client explicitly unsubscribing from group`);
         clientGroupSubscriptions.delete(ws);
         console.log('[WS SUB MAP after unsubscribe]', clientGroupSubscriptions); // Log mappa
      }
      else if (data.type === 'join_visitor_counter') {
           console.log('[WS INFO] Client joined visitor counter explicitly.'); // Giusto per log
       }
      // Aggiungi qui altri eventuali tipi di messaggi gestiti

    } catch (error) {
      console.error('[ERROR] Error parsing WebSocket message:', error);
    }
  });

  // 6. Definisci l'handler per la chiusura della connessione di QUESTO client
  ws.on('close', () => {
    const wasSubscribedTo = clientGroupSubscriptions.get(ws); // Vedi se era iscritto a un gruppo
    console.log(`[WS DISCONNECT] Client disconnected.${wasSubscribedTo ? ` Was subscribed to group ${wasSubscribedTo}.` : ''}`);

    // Rimuovi il client dal Set globale
    clients.delete(ws);
    // Rimuovi l'eventuale sottoscrizione dalla mappa
    clientGroupSubscriptions.delete(ws);

    // Aggiorna il contatore visitatori (se vuoi)
    visitorCount = Math.max(0, visitorCount - 1); // Evita numeri negativi
    console.log(`[WS DISCONNECT] Client removed. Total visitors: ${visitorCount}. Total connections: ${clients.size}`);
    console.log('[WS SUB MAP after close]', clientGroupSubscriptions); // Log mappa

    // Invia il conteggio aggiornato ai client rimanenti
    broadcastVisitorCount();
  });

  // 7. Definisci l'handler per eventuali errori su QUESTO client
   ws.on('error', (error) => {
       console.error('[ERROR] WebSocket error on specific client:', error);
       // La connessione potrebbe chiudersi automaticamente dopo un errore,
       // ma potresti voler fare pulizia aggiuntiva qui se necessario.
   });

});
// --- FINE BLOCCO WEBSOCKET SERVER ---

// ... (La funzione broadcastGroupUpdate che hai già va bene) ...
// function broadcastGroupUpdate(groupId, data) { ... }

// ... (Il resto del tuo codice API, start server, ecc.) ...

// Funzione per inviare aggiornamenti specifici di un gruppo ai client iscritti
function broadcastGroupUpdate(groupId, data) {
  const message = JSON.stringify({ ...data, groupId });
  let sentCount = 0; // Contatore per debug
  console.log(`[WS BROADCASTING] For group ${groupId}:`, data);
  console.log('[WS SUB MAP AT BROADCAST]', clientGroupSubscriptions); // Mostra la mappa al momento del broadcast

  for (const client of clients) { // Assumendo che 'clients' sia il Set di tutti i WS connessi
      const isSubscribed = clientGroupSubscriptions.get(client) === groupId;
      console.log(`[WS BROADCAST CHECK] Client connected: ${client.readyState === WebSocket.OPEN}, Subscribed to ${groupId}? ${isSubscribed}`);

      if (client.readyState === WebSocket.OPEN && isSubscribed) {
          console.log(`[WS SENDING] Sending message to a subscribed client for group ${groupId}.`);
          client.send(message);
          sentCount++;
      }
  }
   console.log(`[WS BROADCAST SENT] Message sent to ${sentCount} clients subscribed to group ${groupId}.`);
}

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

// QUESTA È LA NUOVA VERSIONE (DA USARE)
function requireAdmin(req, res, next) {
  console.log('[DEBUG] requireAdmin middleware checking request...');
  // Controlla direttamente email/password nel body
  const { adminEmail, adminPassword } = req.body;

  if (!adminEmail || !adminPassword) {
    console.log('[DEBUG] requireAdmin: FAILED - Missing adminEmail or adminPassword in request body.');
    return res.status(400).json({ message: 'Admin authentication requires Email and Password in request body for this operation.' });
  }

  console.log(`[DEBUG] requireAdmin: Checking credentials for email: ${adminEmail}`);
  dataStore.findOne('users', {
    email: adminEmail,
    password: adminPassword, // !!! Ricorda: confronto password insicuro !!!
    isAdmin: true
  })
    .then(admin => {
      if (!admin) {
        console.log(`[DEBUG] requireAdmin: FAILED - Admin access denied for ${adminEmail}. Invalid credentials or not an admin.`);
        return res.status(403).json({ message: 'Admin access denied. Invalid credentials or user is not an admin.' });
      }
      console.log(`[DEBUG] requireAdmin: SUCCESS - Admin access granted for ${admin.email}`);
      req.admin = admin;
      next();
    })
    .catch(error => {
      console.error('[ERROR] requireAdmin: Error during admin user lookup:', error);
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

// --- Endpoint Amministrazione Gruppi ---

// Crea un nuovo gruppo (solo Admin)
app.post('/api/admin/groups', requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const newGroup = await dataStore.insert('groups', {
      name,
      description: description || '', // Descrizione opzionale
      createdBy: req.admin._id, // ID dell'admin che l'ha creato
      createdAt: new Date().toISOString(),
      members: [], // Inizia senza membri
    });

    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Ottieni tutti i gruppi (solo Admin - potrebbe essere utile per la gestione)
app.get('/api/admin/groups', requireAdmin, async (req, res) => {
    try {
        const groups = await dataStore.find('groups');
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups for admin:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});


// Elimina un gruppo (solo Admin)
app.delete('/api/admin/groups/:groupId', requireAdmin, async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await dataStore.findOne('groups', { _id: groupId });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Elimina il gruppo
        await dataStore.delete('groups', { _id: groupId });

        // Opzionale: Elimina anche tutti i messaggi associati a quel gruppo
        await dataStore.delete('chatMessages', { groupId: groupId });
        console.log(`Deleted messages for group ${groupId}`);

        res.json({ message: 'Group and associated messages deleted successfully', deletedGroupId: groupId });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Failed to delete group' });
    }
});

// --- Endpoint Utente Gruppi ---

// Ottieni lista di tutti i gruppi visibili agli utenti
// TODO: Proteggere con verifyToken quando implementato
app.get('/api/groups', /* verifyToken, */ async (req, res) => {
  try {
    const groups = await dataStore.find('groups');
    // Restituisci solo le informazioni necessarie per la lista
    const groupList = groups.map(g => ({
      _id: g._id,
      name: g.name,
      description: g.description,
      memberCount: g.members.length // Numero di membri
    }));
    res.json(groupList);
  } catch (error) {
    console.error('Error fetching groups list:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Ottieni dettagli di un gruppo specifico (inclusi membri e messaggi recenti)
// TODO: Proteggere con verifyToken quando implementato
app.get('/api/groups/:groupId', /* verifyToken, */ async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await dataStore.findOne('groups', { _id: groupId });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Ottieni gli ultimi N messaggi (es. ultimi 50)
    const allMessages = await dataStore.find('chatMessages', { groupId: groupId });
    // Ordina per timestamp (assumendo che _id sia basato su Date.now())
    allMessages.sort((a, b) => parseInt(a._id) - parseInt(b._id));
    const recentMessages = allMessages.slice(-50); // Prendi gli ultimi 50

    // Ottieni i dettagli dei membri (per ora solo gli ID)
    // In un DB reale faresti una join o query separate per i nomi
    const memberIds = group.members;
    // const membersDetails = await dataStore.find('users', {_id: {$in: memberIds}}); // Esempio con sintassi tipo MongoDB

    res.json({
      ...group,
      messages: recentMessages, // Aggiungi messaggi
      // members: membersDetails // Potresti voler restituire più dettagli sui membri
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// Entra in un gruppo
// TODO: Proteggere con verifyToken quando implementato e usare req.user.id
app.post('/api/groups/:groupId/join', /* verifyToken, */ async (req, res) => {
  try {
    const { groupId } = req.params;
    // !!! DEVI sostituire 'userIdPlaceholder' con l'ID dell'utente loggato da req.user.id !!!
    const userId = req.body.userId || 'userIdPlaceholder'; // <<< Placeholder insicuro!

    if (userId === 'userIdPlaceholder') {
         console.warn("WARN: Using placeholder User ID for join group. Implement JWT auth!");
        // return res.status(401).json({ message: "Authentication required" }); // Abilita questo con JWT
    }

    const group = await dataStore.findOne('groups', { _id: groupId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Controlla se l'utente è già membro
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member of this group' });
    }

    // Aggiungi l'utente ai membri
    group.members.push(userId);
    await dataStore.update('groups', { _id: groupId }, { members: group.members });

    // Opzionale: Invia notifica via WebSocket agli altri membri
    broadcastGroupUpdate(groupId, { type: 'user_joined', userId });


    res.json({ message: 'Successfully joined the group', group });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Invia un messaggio in un gruppo
// TODO: Proteggere con verifyToken quando implementato e usare req.user!
app.post('/api/groups/:groupId/messages', async (req, res) => {
  try {
      const { groupId } = req.params;
      const { text } = req.body;
      // !!! DEVI ottenere userId e userName dall'utente autenticato (req.user) !!!
      const userId = req.body.userId || 'placeholderUserId-' + Date.now(); // Placeholder diverso e più unico
      const userName = req.body.userName || 'User Placeholder'; // Placeholder insicuro!

      if (userId.startsWith('placeholderUserId')) { // Controllo placeholder
          console.warn("WARN: Using placeholder User for sending message! Implement JWT auth.");
          // In un sistema reale con JWT, se req.user non esiste, restituiresti 401
          // return res.status(401).json({ message: "Authentication required" });
      }
      if (!text || text.trim() === '') { // Aggiunto trim() per controllo messaggio vuoto
          return res.status(400).json({ message: 'Message text cannot be empty' });
      }

      const group = await dataStore.findOne('groups', { _id: groupId });
      if (!group) {
          console.log(`[API MSG POST] Group not found: ${groupId}`);
          return res.status(404).json({ message: 'Group not found' });
      }

      // Verifica se l'utente è membro del gruppo (IMPORTANTE!)
      // Se usi placeholder, questo controllo potrebbe fallire!
      if (!group.members.includes(userId)) {
           console.warn(`[API MSG POST] User ${userId} is not a member of group ${groupId}. Message rejected.`);
           return res.status(403).json({ message: 'You must be a member of the group to send messages' });
      }

      console.log(`[API MSG POST] User ${userName}(${userId}) sending message to group ${groupId}`);
      // Crea e salva il messaggio
      const newMessage = await dataStore.insert('chatMessages', {
          groupId,
          userId,
          userName, // Denormalizzato per comodità
          text: text.trim(), // Salva messaggio trimmato
          timestamp: new Date().toISOString(),
      });

      // Invia il nuovo messaggio via WebSocket a tutti i membri del gruppo connessi
      // Assicurati che broadcastGroupUpdate sia definita e funzioni
      console.log(`[API MSG POST] Message saved (ID: ${newMessage._id}), attempting to broadcast...`);
      broadcastGroupUpdate(groupId, { type: 'new_message', message: newMessage });

      // Rispondi al client HTTP che ha inviato il POST
      res.status(201).json(newMessage);

  } catch (error) {
      console.error('[ERROR] Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message due to server error.' });
  }
});

// Lascia un gruppo
// TODO: Proteggere con verifyToken quando implementato e usare req.user.id
app.post('/api/groups/:groupId/leave', /* verifyToken, */ async (req, res) => {
  try {
    const { groupId } = req.params;
    // !!! DEVI sostituire 'userIdPlaceholder' con l'ID dell'utente loggato da req.user.id !!!
    const userId = req.body.userId || 'userIdPlaceholder'; // <<< Placeholder insicuro!

    if (userId === 'userIdPlaceholder') {
        console.warn("WARN: Using placeholder User ID for leave group. Implement JWT auth!");
         // return res.status(401).json({ message: "Authentication required" }); // Abilita questo con JWT
    }

    const group = await dataStore.findOne('groups', { _id: groupId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Controlla se l'utente è membro
    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: 'User is not a member of this group' });
    }

    // Rimuovi l'utente dai membri
    const updatedMembers = group.members.filter(memberId => memberId !== userId);
    await dataStore.update('groups', { _id: groupId }, { members: updatedMembers });

    // Opzionale: Invia notifica via WebSocket agli altri membri
     broadcastGroupUpdate(groupId, { type: 'user_left', userId });

    res.json({ message: 'Successfully left the group', group: { ...group, members: updatedMembers } });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// --- Endpoint Meditazione ---

// La rotta /api/meditations/genres ora legge da dataStore.meditations,
// che non viene più popolato se tutte le tracce arrivano da Freesound.
// Questa rotta andrà ripensata se si vogliono "generi" derivati dai tag di Freesound.
app.get('/api/meditations/genres', async (req, res) => {
  try {
      console.log(`[API Meditations] Fetching unique genres from dataStore (may be empty if using Freesound).`);
      const meditations = await dataStore.find('meditations');
      const genres = [...new Set(meditations.map(m => m.genre).flat())];
      const validGenres = genres.filter(g => g);
      console.log(`[API Meditations] Sending unique genres from dataStore:`, validGenres);
      res.json(validGenres);
  } catch (error) {
       console.error('[ERROR] Error fetching genres:', error);
       res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

app.post('/api/meditations/history', async (req, res) => {
const userId = req.body.userId || 'userIdPlaceholder';
const { trackId, genre, completed } = req.body;
if (userId === 'userIdPlaceholder') { console.warn("WARN: Using placeholder User ID for listen history."); }
if (!trackId || !genre) { return res.status(400).json({ message: 'Track ID and genre are required for history.' }); }
try {
    console.log(`[API History] Recording listen for User: ${userId}, Track: ${trackId}, Genre: ${genre}`);
    await dataStore.insert('listenHistory', { userId, trackId, genre, completed: completed || false, timestamp: new Date().toISOString() });
    res.status(201).json({ message: 'Listen recorded' });
} catch (error) {
    console.error('[ERROR] Failed to record listen history:', error);
    res.status(500).json({ error: 'Failed to record listen history' });
}
});

// --- ROTTA /api/meditations CHE CHIAMA FREESOUND ---
app.get('/api/meditations', async (req, res) => {
// Leggi la chiave API DENTRO la rotta per essere sicuro
const apiKey = process.env.FREESOUND_API_KEY;

console.log('------------------------------------');
console.log('[DEBUG /api/meditations] Checking API Key INSIDE route handler.');
console.log('[DEBUG /api/meditations] Value for apiKey:', apiKey ? '****** (KEY FOUND)' : '<<<<< KEY IS UNDEFINED or EMPTY >>>>>');
console.log('------------------------------------');

if (!apiKey) {
  console.error("[FATAL ERROR Freesound] API Key is missing or empty INSIDE /api/meditations route handler!");
  return res.status(500).json({ error: 'Internal Server Error: API Key configuration issue preventing Freesound call.' });
}

const query = req.query.query || "nature ambient"; // Aggiunti termini
const genreFilter = req.query.genre; // Questo è un TAG per Freesound
const page = req.query.page || 1;
const pageSize = 15; // Freesound potrebbe avere un max per pagina, controlla documentazione
const licenseFilter = "license:\"Creative Commons 0\" OR license:\"Attribution\""; // Licenze permissive
let searchQuery = `${query} ${licenseFilter}`;
if (genreFilter) {
    searchQuery = `tag:${genreFilter} ${licenseFilter}`;
    console.log(`[API Freesound] Searching by tag: ${genreFilter}`);
} else {
     console.log(`[API Freesound] Searching by base query: ${query}`);
}
const fields = "id,name,username,duration,tags,previews,images,description,license,analysis"; // Aggiunto analysis per info extra
const freesoundUrl = `https://freesound.org/apiv2/search/text/`;

try {
  console.log(`[API Freesound] Calling Freesound API: URL=${freesoundUrl}, Page=${page}, Query="${searchQuery}"`);
  const response = await axios.get(freesoundUrl, {
    headers: { 'Authorization': `Token ${apiKey}` },
    params: { query: searchQuery, page: page, page_size: pageSize, fields: fields, sort: "created_desc" } // Ordina per più recenti
  });
  console.log(`[API Freesound] Received ${response.data.results?.length || 0} results from Freesound.`);

  const mappedMeditations = response.data.results.map(sound => ({
    _id: String(sound.id),
    title: (sound.name || 'Untitled Sound').substring(0, 70), // Limita lunghezza titolo
    artist: sound.username || 'Unknown Artist',
    duration: Math.round(sound.duration || 0),
    genre: sound.tags && sound.tags.length > 0 ? (sound.tags[0].charAt(0).toUpperCase() + sound.tags[0].slice(1)) : 'General', // Primo tag come genere
    tags: sound.tags || [],
    filePath: sound.previews?.['preview-hq-mp3'] || null, // Usa anteprima HQ MP3
    coverArtUrl: sound.images?.['waveform_m'] || null, // Waveform media come cover
    description: (sound.description || '').substring(0, 200), // Limita descrizione
    license: sound.license || null
  })).filter(track => track.filePath); // Filtra solo tracce con un link di anteprima valido

  console.log(`[API Freesound] Sending ${mappedMeditations.length} mapped tracks to frontend.`);
  res.json(mappedMeditations);

} catch (error) {
    console.error("==============================================");
    console.error("[ERROR Freesound API Call] Failed inside /api/meditations route:");
    if (error.response) {
        console.error("  Freesound Status:", error.response.status);
        console.error("  Freesound Headers:", JSON.stringify(error.response.headers, null, 2));
        console.error("  Freesound Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
        console.error("  No response received from Freesound:", error.request);
    } else {
        console.error("  Error setting up Freesound request or other JS error:", error.message);
    }
    console.error("  Full Axios Error Object:", error.toJSON ? JSON.stringify(error.toJSON(), null, 2) : error);
    console.error("==============================================");
    res.status(500).json({ error: 'Failed to fetch meditations from external source. Check server logs for details.' });
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

// backend/server.js

// --- API Admin: Gestione Servizi ---
app.post('/api/admin/services', requireAdmin, async (req, res) => {
  try {
      const { name, description, targetAudience, tags, associatedProfessionalIds, defaultDuration } = req.body;
      if (!name || !description) { return res.status(400).json({ message: 'Name and description are required for service' }); }
      const newService = await dataStore.insert('services', {
          name, description, targetAudience, tags: tags || [], associatedProfessionalIds: associatedProfessionalIds || [], defaultDuration
      });
      res.status(201).json(newService);
  } catch (error) { res.status(500).json({ error: 'Failed to create service' }); }
});

app.put('/api/admin/services/:serviceId', requireAdmin, async (req, res) => {
  try {
       const { serviceId } = req.params;
       const updateData = req.body; // Prendi tutti i campi da aggiornare
       // Rimuovi _id dal corpo se presente per evitare conflitti
       delete updateData._id;
       const result = await dataStore.update('services', { _id: serviceId }, updateData);
       if (result.modifiedCount === 0) return res.status(404).json({ message: 'Service not found or no changes made' });
       const updatedService = await dataStore.findOne('services', { _id: serviceId });
       res.json(updatedService);
  } catch (error) { res.status(500).json({ error: 'Failed to update service' }); }
});

app.delete('/api/admin/services/:serviceId', requireAdmin, async (req, res) => {
   try {
      const { serviceId } = req.params;
      const result = await dataStore.delete('services', { _id: serviceId });
       if (result.deletedCount === 0) return res.status(404).json({ message: 'Service not found' });
       // Potresti voler rimuovere questo serviceId dagli array offeredServiceIds dei professionisti
       res.json({ message: 'Service deleted successfully', deletedServiceId: serviceId });
   } catch (error) { res.status(500).json({ error: 'Failed to delete service' }); }
});

// GET per vedere tutti i servizi (utile per admin)
app.get('/api/admin/services', requireAdmin, async (req, res) => {
  try {
      const services = await dataStore.find('services');
      res.json(services);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch services for admin' }); }
});


// --- API Admin: Gestione Professionisti ---
app.post('/api/admin/professionals', requireAdmin, async (req, res) => {
  try {
      const { name, specialization, bio, profileImageUrl, offeredServiceIds } = req.body;
       if (!name || !specialization) { return res.status(400).json({ message: 'Name and specialization are required' }); }
       const newProf = await dataStore.insert('professionals', {
           name, specialization, bio, profileImageUrl, offeredServiceIds: offeredServiceIds || []
       });
       res.status(201).json(newProf);
  } catch (error) { res.status(500).json({ error: 'Failed to create professional' }); }
});

app.put('/api/admin/professionals/:profId', requireAdmin, async (req, res) => {
   try {
       const { profId } = req.params;
       const updateData = req.body;
       delete updateData._id;
       const result = await dataStore.update('professionals', { _id: profId }, updateData);
        if (result.modifiedCount === 0) return res.status(404).json({ message: 'Professional not found or no changes made' });
        const updatedProf = await dataStore.findOne('professionals', { _id: profId });
        res.json(updatedProf);
   } catch (error) { res.status(500).json({ error: 'Failed to update professional' }); }
});

app.delete('/api/admin/professionals/:profId', requireAdmin, async (req, res) => {
    try {
       const { profId } = req.params;
       const result = await dataStore.delete('professionals', { _id: profId });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Professional not found' });
        // Potresti voler rimuovere questo profId dagli array associatedProfessionalIds dei servizi
        res.json({ message: 'Professional deleted successfully', deletedProfId: profId });
    } catch (error) { res.status(500).json({ error: 'Failed to delete professional' }); }
});

// GET per vedere tutti i professionisti (utile per admin)
app.get('/api/admin/professionals', requireAdmin, async (req, res) => {
   try {
       const professionals = await dataStore.find('professionals');
       res.json(professionals);
   } catch (error) { res.status(500).json({ error: 'Failed to fetch professionals for admin' }); }
});

// backend/server.js

// GET /api/services - Ottiene tutti i servizi con i dettagli dei professionisti associati
// TODO: Proteggere con verifyToken se necessario
app.get('/api/services', async (req, res) => {
  try {
      const services = await dataStore.find('services');
      const professionals = await dataStore.find('professionals'); // Carica tutti i professionisti

      // Mappa per accesso rapido ai professionisti per ID
      const professionalsMap = new Map(professionals.map(p => [p._id, p]));

      // "Popola" i professionisti associati per ogni servizio
      const populatedServices = services.map(service => {
          const associatedProfessionals = (service.associatedProfessionalIds || [])
              .map(profId => professionalsMap.get(profId)) // Trova l'oggetto professionista
              .filter(prof => prof); // Rimuovi eventuali ID non trovati

           // Restituisci solo i dati necessari dei professionisti per la card servizio
          const professionalsSummary = associatedProfessionals.map(prof => ({
              _id: prof._id,
              name: prof.name,
              specialization: prof.specialization
          }));

          return {
              ...service,
              professionals: professionalsSummary // Sostituisci l'array di ID con oggetti riassuntivi
          };
      });

      res.json(populatedServices);
  } catch (error) {
       console.error("[ERROR] Failed to fetch populated services:", error);
       res.status(500).json({ error: 'Failed to fetch services' });
  }
});


// backend/server.js

// Funzione Helper (metti prima delle rotte che la usano)
function generateSlots(startTime, endTime, slotDurationMinutes) {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let currentH = startH; let currentM = startM;
  while (currentH * 60 + currentM < endH * 60 + endM) {
      const slotTime = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
      slots.push(slotTime);
      currentM += slotDurationMinutes;
      currentH += Math.floor(currentM / 60);
      currentM %= 60;
      if (currentH * 60 + currentM + slotDurationMinutes > endH * 60 + endM) {
           if(currentH * 60 + currentM <= endH * 60 + endM){}
           break;
      }
  }
  return slots;
}


// Rotta API per la Disponibilità (metti prima di server.listen)
// GET /api/availability/:professionalId?date=YYYY-MM-DD
app.get('/api/availability/:professionalId', async (req, res) => { // Rimosso commento verifyToken per ora
  const { professionalId } = req.params;
  const requestedDateStr = req.query.date;

  if (!requestedDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(requestedDateStr)) { // Aggiunto check formato YYYY-MM-DD
      return res.status(400).json({ message: 'Valid date query parameter (YYYY-MM-DD) is required.' });
  }

  let requestedDate;
  try {
      requestedDate = new Date(requestedDateStr + 'T00:00:00Z');
      if (isNaN(requestedDate.getTime())) throw new Error('Invalid Date Object');
  } catch (e) {
       return res.status(400).json({ message: 'Invalid date value.' });
  }

  const dayOfWeek = requestedDate.getUTCDay();

  console.log(`[API Availability] Checking for Prof: ${professionalId}, Date: ${requestedDateStr}, DayOfWeek: ${dayOfWeek}`);

  try {
      const potentialAvailabilityBlocks = await dataStore.find('availabilities', { professionalId: String(professionalId), dayOfWeek }); // Assicura che ID sia stringa se necessario
      console.log(`[API Availability] Found ${potentialAvailabilityBlocks.length} potential availability blocks.`);

      const existingAppointments = await dataStore.find('appointments', { professionalId: String(professionalId), date: requestedDateStr });
      const bookedSlots = new Set(existingAppointments.map(app => app.time));
      console.log(`[API Availability] Found ${existingAppointments.length} existing appointments on ${requestedDateStr}. Booked slots:`, bookedSlots);

      let availableSlots = [];
      for (const block of potentialAvailabilityBlocks) {
          // Assicurati che slotDurationMinutes esista e sia un numero > 0
          const duration = block.slotDurationMinutes && block.slotDurationMinutes > 0 ? block.slotDurationMinutes : 60; // Default a 60 min se mancante/invalido
          const slotsInBlock = generateSlots(block.startTime, block.endTime, duration);
          console.log(`[API Availability] Generating slots for block ${block._id} (${block.startTime}-${block.endTime}, ${duration}min):`, slotsInBlock);
          const freeSlotsInBlock = slotsInBlock.filter(slot => !bookedSlots.has(slot));
          console.log(`[API Availability] Free slots in block ${block._id}:`, freeSlotsInBlock);
          availableSlots = availableSlots.concat(freeSlotsInBlock);
      }

      availableSlots = [...new Set(availableSlots)].sort();

       console.log(`[API Availability] Final available slots for ${requestedDateStr}:`, availableSlots);
      res.json(availableSlots);

  } catch (error) {
       console.error('[ERROR] Failed to get availability:', error);
       res.status(500).json({ error: 'Failed to retrieve availability' });
  }
});

// backend/server.js

// ... (dopo le altre API) ...
app.post('/api/appointments', async (req, res) => {
  // !!! USA req.user.id dal token JWT al posto di req.body.userId !!!
  const userId = req.body.userId || 'placeholderUserId-' + Date.now(); // Usa placeholder diverso se non loggato/test
  const { professionalId, serviceId, date, time } = req.body;

  if (!professionalId || !serviceId || !date || !time) {
      return res.status(400).json({ message: 'Missing required booking information (professionalId, serviceId, date, time).' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
       return res.status(400).json({ message: 'Invalid date (YYYY-MM-DD) or time (HH:MM) format.' });
  }

  console.log(`[API POST Appointment] Received booking request for User: ${userId}`, req.body);

  try {
      // Controllo Disponibilità (Anti-Race Condition)
      let requestedDate;
      try { requestedDate = new Date(date + 'T00:00:00Z'); if(isNaN(requestedDate.getTime())) throw new Error();} catch { return res.status(400).json({message:'Invalid date value.'});}
      const dayOfWeek = requestedDate.getUTCDay();
      const potentialBlocks = await dataStore.find('availabilities', { professionalId: String(professionalId), dayOfWeek });

      if (potentialBlocks.length === 0) { return res.status(409).json({ message: 'Professional not available on the selected day.' }); }

      let isSlotWithinBlock = false; let slotDuration = 60;
      for (const block of potentialBlocks) {
           const duration = block.slotDurationMinutes && block.slotDurationMinutes > 0 ? block.slotDurationMinutes : 60;
           const blockSlots = generateSlots(block.startTime, block.endTime, duration);
           if (blockSlots.includes(time)) { isSlotWithinBlock = true; slotDuration = duration; break; }
      }
      if (!isSlotWithinBlock) { return res.status(409).json({ message: 'Selected time slot is outside available hours.' }); }

      const existingAppointment = await dataStore.findOne('appointments', { professionalId: String(professionalId), date: date, time: time });
      if (existingAppointment) { return res.status(409).json({ message: 'Sorry, this time slot was just booked.' }); }

      console.log(`[API POST Appointment] Slot available. Creating appointment...`);
      const service = await dataStore.findOne('services', { _id: serviceId });
      const professional = await dataStore.findOne('professionals', { _id: professionalId });

      const newAppointment = await dataStore.insert('appointments', {
          userId, professionalId, serviceId, date, time,
          durationMinutes: service?.defaultDuration || slotDuration,
          serviceName: service?.name || 'Unknown Service',
          professionalName: professional?.name || 'Unknown Professional',
          status: 'confirmed',
          createdAt: new Date().toISOString()
      });

      console.log(`[API POST Appointment] Appointment created successfully:`, newAppointment._id);
      res.status(201).json(newAppointment);

  } catch (error) {
      console.error('[ERROR] Failed to create appointment:', error);
      res.status(500).json({ error: 'Failed to book appointment due to a server error.' });
  }
});

// GET /api/appointments?userId=... - Recupera appuntamenti per un utente
app.get('/api/appointments', async (req, res) => {
  const userId = req.query.userId || 'placeholderUserId-' + Date.now(); // <-- USA req.user.id DA TOKEN!

  if (!userId || userId.startsWith('placeholderUserId')) { // Modificato controllo per placeholder
      console.warn('[API GET Appointments] Attempted fetch without valid User ID.');
      return res.status(401).json({ message: 'Authentication required to view appointments.' }); // Cambiato in 401
  }

  console.log(`[API GET Appointments] Fetching appointments for User ID: ${userId}`);
  try {
      const userAppointments = await dataStore.find('appointments', { userId: userId });
      userAppointments.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
      console.log(`[API GET Appointments] Found ${userAppointments.length} appointments for User ID: ${userId}`);
      res.json(userAppointments);
  } catch (error) {
      console.error(`[ERROR] Failed to fetch appointments for User ID ${userId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve appointments.' });
  }
});

// DELETE /api/appointments/:appointmentId - Cancella un appuntamento
app.delete('/api/appointments/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  const userIdMakingRequest = 'placeholderUserId-' + Date.now(); // <-- USA req.user.id DA TOKEN!

  console.log(`[API DELETE Appointment] Request by ${userIdMakingRequest} to delete appointment ID: ${appointmentId}`);
  try {
      const appointment = await dataStore.findOne('appointments', { _id: appointmentId });
      if (!appointment) { return res.status(404).json({ message: 'Appointment not found.' }); }

      // !!! CONTROLLO PROPRIETARIO FONDAMENTALE (da abilitare con JWT) !!!
      // if (appointment.userId !== userIdMakingRequest) {
      //     return res.status(403).json({ message: 'You are not authorized to cancel this appointment.' });
      // }
      console.warn(`[API DELETE Appointment] SECURITY TODO: Implement ownership check!`);

      const result = await dataStore.delete('appointments', { _id: appointmentId });
      if (result.deletedCount === 0) { return res.status(500).json({ message: 'Failed to cancel appointment (delete operation failed).' });}

      console.log(`[API DELETE Appointment] Appointment ${appointmentId} cancelled successfully.`);
      res.status(200).json({ message: 'Appointment cancelled successfully.', cancelledAppointmentId: appointmentId });
  } catch (error) {
      console.error(`[ERROR] Failed to cancel appointment ${appointmentId}:`, error);
      res.status(500).json({ error: 'Failed to cancel appointment.' });
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