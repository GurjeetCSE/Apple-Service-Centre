const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = process.env.NODE_ENV === 'production' 
    ? path.join('/tmp', 'users.db') 
    : path.join(__dirname, 'users.db');

let db; // SQLite database instance

// ============ INITIALIZE DATABASE ============
async function initDB() {
    const SQL = await initSqlJs();

    try {
        if (fs.existsSync(DB_PATH)) {
            const fileBuffer = fs.readFileSync(DB_PATH);
            db = new SQL.Database(fileBuffer);
        } else {
            db = new SQL.Database();
        }
    } catch (err) {
        console.log('  ⚠️ Database load failed, starting fresh in memory');
        db = new SQL.Database();
    }

    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    saveDB();
    console.log('  ✅ SQLite database ready');
}

// Save database to file
function saveDB() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// ============ MIDDLEWARE ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(session({
    secret: 'apple-service-centre-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ============ API ROUTES ============

// Signup
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'All fields are required.' });
    }
    if (password.length < 6) {
        return res.json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if email exists
    const existing = db.exec("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0 && existing[0].values.length > 0) {
        return res.json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password & insert
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
    saveDB();

    res.json({ success: true, message: 'Account created successfully!' });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Please enter both email and password.' });
    }

    const result = db.exec("SELECT * FROM users WHERE email = ?", [email]);
    if (result.length === 0 || result[0].values.length === 0) {
        return res.json({ success: false, message: 'Invalid email or password.' });
    }

    const row = result[0].values[0];
    const cols = result[0].columns;
    const user = {};
    cols.forEach((col, i) => { user[col] = row[i]; });

    if (!bcrypt.compareSync(password, user.password)) {
        return res.json({ success: false, message: 'Invalid email or password.' });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.json({ success: true, message: 'Login successful!', user: { name: user.name, email: user.email } });
});

// Get current user
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Logout
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// ============ START ============
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n  🍎 Apple Service Centre is running!`);
        console.log(`  ➜ Open: http://localhost:${PORT}\n`);
    });
});

module.exports = app;
