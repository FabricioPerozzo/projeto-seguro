require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./connection');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

const users = [
    { username: 'admin', email: 'admin@teste.com', password: 'admin123' },
    { username: 'usuario', email: 'usuario@teste.com', password: 'senha123' }
];

async function seed() {
    console.log('Inserindo dados de teste...');

    for (const user of users) {
        const hash = await bcrypt.hash(user.password, saltRounds);

        db.run(
            'INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)',
            [user.username, user.email, hash],
            (err) => {
                if (err) {
                    console.error(`Erro ao inserir "${user.username}":`, err.message);
                } else {
                    console.log(`Usuário "${user.username}" inserido (senha: ${user.password})`);
                }
            }
        );
    }

    setTimeout(() => {
        db.close((err) => {
            if (err) console.error('Erro ao fechar banco:', err.message);
            else console.log('Seed finalizado');
        });
    }, 1000);
}

seed();
