const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || './database.db';

const db = new sqlite3.Database(path.resolve(dbPath), (err) => {
    if (err) {
        console.error('Erro ao conectar no banco:', err.message);
        process.exit(1);
    }
    console.log('Banco conectado com sucesso');
});

db.run('PRAGMA journal_mode=WAL');
db.run('PRAGMA foreign_keys=ON');

module.exports = db;
