const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');
const port = 3000;

let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connesso al database SQLite.');
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*', // Permetti l'accesso da tutte le origini
}));

// Creazione della tabella utenti se non esiste
db.run(`
  CREATE TABLE IF NOT EXISTS utenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT UNIQUE,
    password TEXT
  )
`);

// Endpoint POST per registrare un nuovo utente
app.post('/register', (req, res) => {
    const { nome, email, password } = req.body;

    // Verifica se l'email è già in uso
    db.get("SELECT * FROM utenti WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ message: "Email già in uso" });

        // Inserimento dell'utente
        db.run("INSERT INTO utenti (nome, email, password) VALUES (?, ?, ?)",
            [nome, email, password],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Registrazione avvenuta con successo', id: this.lastID });
            });
    });
});
// Endpoint GET per ottenere tutti gli utenti senza autenticazione
app.get('/users', (req, res) => {
    db.all("SELECT id, nome, email FROM utenti", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});
// Endpoint POST per il login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM utenti WHERE email = ?", [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ message: "Utente non trovato" });

        // Verifica della password senza hashing
        // **Attenzione**: questa parte è insicura, utilizza hashing in produzione
        if (user.password !== password) return res.status(400).json({ message: "Password errata" });

        res.json({ message: 'Login avvenuto con successo', user });
    });
});

// Endpoint protetto - ora è aperto senza autenticazione
app.get('/dashboard', (req, res) => {
    res.json({ message: 'Benvenuto nella dashboard' });
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

// Ascolta su tutte le interfacce di rete
app.listen(port, '0.0.0.0', () => {
    console.log(`Server API in esecuzione su http://188.245.208.24:${port}`);
});
