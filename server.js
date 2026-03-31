require('dotenv').config({quiet: true});
const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db/connection');

const app = express();

const PORT = parseInt(process.env.PORT) || 3001;
const SESSION_SECRET = process.env.SESSION_SECRET;
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE) || 180000;
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

if (!SESSION_SECRET) {
    console.error('SESSION_SECRET não definido no .env');
    process.exit(1);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: SESSION_MAX_AGE,
        httpOnly: true,
        sameSite: 'strict'
    }
}));

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

    const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
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
        'SELECT * FROM users WHERE username = ?',
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

app.listen(PORT, () => {
    console.log(`Sistema rodando em http://localhost:${PORT}`);
});
