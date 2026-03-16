const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS journals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                ambience TEXT NOT NULL,
                text TEXT NOT NULL,
                emotion TEXT,
                keywords TEXT,
                date TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(userId) REFERENCES users(id)
            )`);
        });
    }
});

module.exports = db;
