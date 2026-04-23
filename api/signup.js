const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = '/tmp/users.db';
let db;

async function getDB() {
    if (db) return db;
    const SQL = await initSqlJs();
    try {
        if (fs.existsSync(DB_PATH)) {
            db = new SQL.Database(fs.readFileSync(DB_PATH));
        } else {
            db = new SQL.Database();
        }
    } catch (e) {
        db = new SQL.Database();
    }
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL)`);
    return db;
}

function saveDB() {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.json({ success: false, message: 'All fields are required.' });
    if (password.length < 6) return res.json({ success: false, message: 'Password must be at least 6 characters.' });

    const database = await getDB();
    const existing = database.exec("SELECT id FROM users WHERE email = '" + email.replace(/'/g, "''") + "'");
    if (existing.length > 0 && existing[0].values.length > 0) {
        return res.json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashed]);
    saveDB();

    res.json({ success: true, message: 'Account created successfully!' });
};
