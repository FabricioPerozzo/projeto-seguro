require('dotenv').config({ quiet: true });
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
app.use(express.json());
app.use(express.static('public'));

app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: SESSION_MAX_AGE,
            httpOnly: true,
            sameSite: 'strict'
        }
    })
);

function auth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/?erro=auth');
    }
    next();
}

app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, 'views/register.html'));
});

app.get('/dashboard', auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{6,}$/;
    if (!password || !passwordRegex.test(password)) {
        return res.redirect('/register?erro=senha');
    }

    const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hash],
        (err) => {
            if (err) {
                return res.redirect('/register?erro=duplicado');
            }
            res.redirect('/?sucesso=1');
        }
    );
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (!user) {
            return res.redirect('/?erro=credenciais');
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.redirect('/?erro=credenciais');
        }

        req.session.userId = user.id;
        req.session.user = {
            username: user.username,
            email: user.email
        };

        res.redirect('/dashboard');
    });
});

app.get('/user', auth, (req, res) => {
    res.json(req.session.user);
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

function authApi(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Nao autenticado' });
    }
    next();
}

app.get('/api/todos', authApi, (req, res) => {
    db.all(
        'SELECT id, title, done FROM todos WHERE user_id = ? ORDER BY created_at DESC',
        [req.session.userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao buscar tarefas' });
            }
            res.json(rows);
        }
    );
});

app.post('/api/todos', authApi, (req, res) => {
    const { title } = req.body;
    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Titulo obrigatorio' });
    }
    db.run(
        'INSERT INTO todos (user_id, title) VALUES (?, ?)',
        [req.session.userId, title.trim()],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Erro ao criar tarefa' });
            }
            res.json({ id: this.lastID, title: title.trim(), done: 0 });
        }
    );
});

app.put('/api/todos/:id', authApi, (req, res) => {
    const { done } = req.body;
    db.run(
        'UPDATE todos SET done = ? WHERE id = ? AND user_id = ?',
        [done ? 1 : 0, req.params.id, req.session.userId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Erro ao atualizar tarefa' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Tarefa nao encontrada' });
            }
            res.json({ ok: true });
        }
    );
});

app.delete('/api/todos/:id', authApi, (req, res) => {
    db.run(
        'DELETE FROM todos WHERE id = ? AND user_id = ?',
        [req.params.id, req.session.userId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Erro ao remover tarefa' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Tarefa nao encontrada' });
            }
            res.json({ ok: true });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Sistema rodando em http://localhost:${PORT}`);
});
