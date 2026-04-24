const bcrypt = require('bcryptjs');
const { getDB, saveDB } = require('./db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.json({ success: false, message: 'All fields are required.' });
    if (password.length < 6) return res.json({ success: false, message: 'Password must be at least 6 characters.' });

    const database = await getDB();
    const stmt = database.prepare("SELECT id FROM users WHERE email = ?");
    stmt.bind([email]);
    const exists = stmt.step();
    stmt.free();

    if (exists) {
        return res.json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashed]);
    saveDB();

    res.json({ success: true, message: 'Account created successfully!' });
};
