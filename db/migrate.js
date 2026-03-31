require('dotenv').config();
const db = require('./connection');

const migrations = [
    {
        name: 'create_users_table',
        sql: `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `
    }
];

console.log('Executando migrations...');

migrations.forEach(({ name, sql }) => {
    db.run(sql, (err) => {
        if (err) {
            console.error(`Erro na migration "${name}":`, err.message);
        } else {
            console.log(`Migration "${name}" executada com sucesso`);
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Erro ao fechar banco:', err.message);
    } else {
        console.log('Migrations finalizadas');
    }
});
