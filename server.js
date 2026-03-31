const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

console.log("Iniciando servidor...");

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("Erro ao conectar no banco:", err.message);
    } else {
        console.log("Banco conectado com sucesso");
    }
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(session({
    secret: 'chave_segura_simples',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3 * 60 * 1000
    }
}));

db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
)
`);

function auth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/register.html'));
});

app.get('/dashboard', auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!password || password.length < 6) {
        return res.send('Senha deve ter no mínimo 6 caracteres');
    }

    const hash = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
        [username, email, hash],
        (err) => {
            if (err) return res.send('Usuário ou email já existe');
            res.redirect('/');
        }
    );
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        async (err, user) => {

            if (!user) return res.redirect('/?erro=usuario');

            const valid = await bcrypt.compare(password, user.password);

            if (!valid) return res.send('Senha incorreta');

            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email
            };

            res.redirect('/dashboard');
        }
    );
});

app.get('/user', auth, (req, res) => {
    res.json(req.session.user);
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3001, () => {
    console.log('Sistema rodando em http://localhost:3001');
});