const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');

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

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false, message: 'Please enter both email and password.' });

    const database = await getDB();
    const result = database.exec("SELECT * FROM users WHERE email = '" + email.replace(/'/g, "''") + "'");
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

    // Set a cookie with user info (simple approach for serverless)
    const userData = JSON.stringify({ name: user.name, email: user.email });
    res.setHeader('Set-Cookie', `user=${encodeURIComponent(userData)}; Path=/; Max-Age=86400; SameSite=Lax`);
    res.json({ success: true, message: 'Login successful!', user: { name: user.name, email: user.email } });
};
