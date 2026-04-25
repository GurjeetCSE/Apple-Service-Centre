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
let isInitializing = false;

// ============ INITIALIZE DATABASE ============
async function initDB() {
    if (db) return; // Already initialized
    if (isInitializing) return; // Avoid parallel init
    isInitializing = true;
    
    try {
        const SQL = await initSqlJs({
            locateFile: file => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file)
        });

        if (fs.existsSync(DB_PATH)) {
            const fileBuffer = fs.readFileSync(DB_PATH);
            db = new SQL.Database(fileBuffer);
        } else {
            db = new SQL.Database();
        }
    } catch (err) {
        console.log('  ⚠️ Database load failed, starting fresh in memory');
        const SQL = await initSqlJs({
            locateFile: file => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file)
        });
        db = new SQL.Database();
    }

    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS repairs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT NOT NULL, device_type TEXT NOT NULL, model TEXT NOT NULL, issue TEXT NOT NULL, status TEXT DEFAULT 'Pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, user_name TEXT NOT NULL, rating INTEGER NOT NULL, comment TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT NOT NULL, message TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    
    saveDB();
    console.log('  ✅ SQLite database ready');
    isInitializing = false;
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
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'apple-service-centre-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ============ API ROUTES ============

// Auth: Get current user
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Auth: Signup
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.json({ success: false, message: 'All fields are required.' });
    const stmt = db.prepare("SELECT id FROM users WHERE email = ?");
    stmt.bind([email]);
    if (stmt.step()) { stmt.free(); return res.json({ success: false, message: 'Email already exists.' }); }
    stmt.free();
    const hashed = bcrypt.hashSync(password, 10);
    db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashed]);
    saveDB();
    res.json({ success: true, message: 'Account created!' });
});

// Auth: Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    stmt.bind([email]);
    if (!stmt.step()) { stmt.free(); return res.json({ success: false, message: 'Invalid credentials.' }); }
    const user = stmt.getAsObject();
    stmt.free();
    if (!bcrypt.compareSync(password, user.password)) return res.json({ success: false, message: 'Invalid credentials.' });
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.json({ success: true, message: 'Welcome!', user: { name: user.name, email: user.email } });
});

// Profile: Update
app.post('/api/update-profile', (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false });
    const { name } = req.body;
    db.run("UPDATE users SET name = ? WHERE email = ?", [name, req.session.user.email]);
    req.session.user.name = name;
    saveDB();
    res.json({ success: true, user: req.session.user });
});

// Repairs: Book
app.post('/api/book-repair', (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false });
    const { deviceType, model, issue } = req.body;
    db.run("INSERT INTO repairs (user_email, device_type, model, issue) VALUES (?, ?, ?, ?)", [req.session.user.email, deviceType, model, issue]);
    saveDB();
    res.json({ success: true, message: 'Repair booked!' });
});

// Repairs: Get My
app.get('/api/my-repairs', (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false });
    const stmt = db.prepare("SELECT * FROM repairs WHERE user_email = ? ORDER BY created_at DESC");
    stmt.bind([req.session.user.email]);
    const repairs = [];
    while(stmt.step()) repairs.push(stmt.getAsObject());
    stmt.free();
    res.json({ success: true, repairs });
});

// Repairs: Admin Get All
app.get('/api/admin-repairs', (req, res) => {
    const stmt = db.prepare("SELECT * FROM repairs ORDER BY created_at DESC");
    const repairs = [];
    while(stmt.step()) repairs.push(stmt.getAsObject());
    stmt.free();
    res.json({ success: true, repairs });
});

// Repairs: Update Status
app.post('/api/update-status', (req, res) => {
    const { repairId, newStatus } = req.body;
    const stmt = db.prepare("SELECT user_email, device_type FROM repairs WHERE id = ?");
    stmt.bind([repairId]);
    if (stmt.step()) {
        const r = stmt.getAsObject();
        db.run("INSERT INTO notifications (user_email, message) VALUES (?, ?)", [r.user_email, `Your ${r.device_type} repair status: ${newStatus}`]);
    }
    stmt.free();
    db.run("UPDATE repairs SET status = ? WHERE id = ?", [newStatus, repairId]);
    saveDB();
    res.json({ success: true });
});

// Reviews: Add
app.post('/api/add-review', (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false });
    const { rating, comment } = req.body;
    db.run("INSERT INTO reviews (user_name, rating, comment) VALUES (?, ?, ?)", [req.session.user.name, rating, comment]);
    saveDB();
    res.json({ success: true, message: 'Thanks!' });
});

// Reviews: Get All
app.get('/api/get-reviews', (req, res) => {
    const stmt = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 6");
    const reviews = [];
    while(stmt.step()) reviews.push(stmt.getAsObject());
    stmt.free();
    res.json({ success: true, reviews });
});

// Notifications: Get
app.get('/api/get-notifications', (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false });
    const stmt = db.prepare("SELECT * FROM notifications WHERE user_email = ? AND is_read = 0 ORDER BY created_at DESC");
    stmt.bind([req.session.user.email]);
    const notifications = [];
    while(stmt.step()) notifications.push(stmt.getAsObject());
    stmt.free();
    if (notifications.length > 0) {
        db.run("UPDATE notifications SET is_read = 1 WHERE user_email = ?", [req.session.user.email]);
        saveDB();
    }
    res.json({ success: true, notifications });
});

// Logout
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// ============ START ============
if (!process.env.VERCEL) {
    initDB().then(() => {
        app.listen(PORT, () => {
            console.log(`\n  🍎 Apple Service Centre is running!`);
            console.log(`  ➜ Open: http://localhost:${PORT}\n`);
        });
    });
} else {
    // On Vercel, just init DB (it's async but Vercel will wait for the first request)
    initDB();
}

module.exports = app;
