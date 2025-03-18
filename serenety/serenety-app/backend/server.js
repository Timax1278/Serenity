// Import necessary modules
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Create an instance of the Express app
const app = express();
const port = process.env.PORT || 5000;

// Setup middleware
app.use(express.json());

// Create a simple data store
const dataStore = {
  data: {},
  
  async load() {
    try {
      const filePath = path.join(__dirname, 'data.json');
      const data = await fs.readFile(filePath, 'utf8');
      this.data = JSON.parse(data);
      console.log('Data loaded from file');
    } catch (error) {
      console.log('No existing data found or error reading file, starting with empty data store');
      this.data = {};
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
    await this.save();
    return document;
  },
  
  async find(collection, query = {}) {
    const documents = this.getCollection(collection);
    // Very basic query implementation
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
dataStore.load();

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Local data store is active',
    mode: 'file-based' 
  });
});

// User routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await dataStore.find('users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = await dataStore.insert('users', req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await dataStore.findOne('users', { _id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Using file-based data store as fallback');
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Server shutting down...');
  await dataStore.save();
  process.exit(0);
});