// server.js

// 1. Import required dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// 2. Initialize Express and create the HTTP server
const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret_key';
const server = http.createServer(app);

// 3. Apply middleware
app.use(cors());
app.use(bodyParser.json());

// 4. Configure Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mental Health Platform API',
      version: '1.0.0',
      description: 'API per la piattaforma di salute mentale'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            name: { type: 'string' },
            surname: { type: 'string' },
            roles: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    }
  },
  apis: ['./server.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Effettua il login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login effettuato con successo
 *       401:
 *         description: Credenziali non valide
 */

// 5. Define a mock database for users and groups
const users = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin',
    surname: 'User',
    roles: ['admin']
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'user123',
    name: 'Regular',
    surname: 'User',
    roles: ['user']
  }
];

const groups = [
  {
    id: 1,
    name: 'Ansia e stress',
    description: 'Gruppo di supporto per gestire ansia e stress',
    category: 'ansia',
    members: 15,
    maxMembers: 30,
    isPrivate: false
  },
  {
    id: 2,
    name: 'Depressione',
    description: 'Condividi esperienze e supporto per la depressione',
    category: 'depressione',
    members: 10,
    maxMembers: 20,
    isPrivate: false
  }
];

// 6. Authentication routes

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '2h' });
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      roles: user.roles
    }
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, surname } = req.body;

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'Email già in uso' });
  }

  const newUser = {
    id: users.length + 1,
    email,
    password,
    name,
    surname,
    roles: ['user']
  };

  users.push(newUser);
  const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '2h' });
  return res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      surname: newUser.surname,
      roles: newUser.roles
    }
  });
});

// 7. Middleware per l'autenticazione
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token mancante' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token non valido' });
    req.user = user;
    next();
  });
}

// 8. Groups routes
app.get('/api/groups', authenticateToken, (req, res) => {
  res.json(groups);
});

app.get('/api/groups/:id', authenticateToken, (req, res) => {
  const group = groups.find(g => g.id === parseInt(req.params.id));
  
  if (!group) {
    return res.status(404).json({ message: 'Gruppo non trovato' });
  }
  
  res.json(group);
});

// 9. Configure WebSocket with Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
});

let onlineUsers = 0;

io.on('connection', (socket) => {
  console.log('Un utente si è connesso');
  onlineUsers++;
  io.emit('userCountUpdate', { count: onlineUsers });

  socket.on('disconnect', () => {
    console.log('Un utente si è disconnesso');
    onlineUsers--;
    io.emit('userCountUpdate', { count: onlineUsers });
  });
});

// 10. Start the server
server.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
});
