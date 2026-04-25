const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Use /tmp for Vercel, or local directory for dev
const DB_PATH = process.env.VERCEL ? '/tmp/users.db' : path.join(process.cwd(), 'users.db');
let db = null;
let SQL = null;
let isInitializing = false;

/**
 * Initializes and returns the SQLite database instance.
 * @returns {Promise<any>} The SQL.js database instance.
 */
async function getDB() {
    if (db) return db;
    if (isInitializing) {
        // Wait for initialization to complete
        while (isInitializing) await new Promise(r => setTimeout(r, 50));
        return db;
    }
    
    isInitializing = true;
    try {
        if (!SQL) {
            SQL = await initSqlJs({
                locateFile: file => `https://sql.js.org/dist/${file}`
            });
        }

        if (fs.existsSync(DB_PATH)) {
            const fileBuffer = fs.readFileSync(DB_PATH);
            db = new SQL.Database(fileBuffer);
        } else {
            db = new SQL.Database();
            // Create tables...
            db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
            db.run(`CREATE TABLE IF NOT EXISTS repairs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT NOT NULL, device_type TEXT NOT NULL, model TEXT NOT NULL, issue TEXT NOT NULL, status TEXT DEFAULT 'Pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
            db.run(`CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, user_name TEXT NOT NULL, rating INTEGER NOT NULL, comment TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
            db.run(`CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT NOT NULL, message TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
            db.run(`CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL, message TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
            db.run(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
            db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('maintenance_mode', 'off')");
        }
        isInitializing = false;
        return db;
    } catch (e) {
        console.error('Database init error:', e);
        isInitializing = false;
        throw e;
    }
}

/**
 * Persists the current database state to the filesystem.
 */
function saveDB() {
    if (!db) return;
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
}

module.exports = { getDB, saveDB };
