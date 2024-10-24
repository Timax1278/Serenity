const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const port = 3000;

const SECRET_KEY = 'supersecretkey'; // Chiave segreta per firmare i token

let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connesso al database SQLite.');
});

app.use(express.json());
app.use(cors());

// Creazione della tabella utenti se non esiste
db.run(`
  CREATE TABLE IF NOT EXISTS utenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT UNIQUE,
    password TEXT
  )
`);

// Funzione per generare un token JWT
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
};

// Middleware per verificare l'autenticazione tramite token JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Endpoint POST per registrare un nuovo utente
app.post('/register', (req, res) => {
    const { nome, email, password } = req.body;

    // Verifica se l'email è già in uso
    db.get("SELECT * FROM utenti WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ message: "Email già in uso" });

        // Inserimento dell'utente senza hashing della password
        db.run("INSERT INTO utenti (nome, email, password) VALUES (?, ?, ?)",
            [nome, email, password],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Registrazione avvenuta con successo', id: this.lastID });
            });
    });
});

// Endpoint POST per il login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM utenti WHERE email = ?", [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ message: "Utente non trovato" });

        // Verifica diretta della password senza hashing
        if (user.password !== password) return res.status(400).json({ message: "Password errata" });

        // Genera un token JWT per l'utente
        const token = generateToken(user);
        res.json({ message: 'Login avvenuto con successo', token });
    });
});

// Endpoint protetto - solo accessibile con un token valido
app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: `Benvenuto nella dashboard, ${req.user.email}` });
});

// Gestione della chiusura del database
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Chiusura del database SQLite.');
        process.exit(0);
    });
});

app.listen(port, () => {
    console.log(`Server API in esecuzione su http://localhost:${port}`);
});
