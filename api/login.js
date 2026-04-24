const bcrypt = require('bcryptjs');
const { getDB } = require('./db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false, message: 'Please enter both email and password.' });

    const database = await getDB();
    const stmt = database.prepare("SELECT * FROM users WHERE email = ?");
    stmt.bind([email]);
    
    if (!stmt.step()) {
        stmt.free();
        return res.json({ success: false, message: 'Invalid email or password.' });
    }
    const user = stmt.getAsObject();
    stmt.free();

    if (!bcrypt.compareSync(password, user.password)) {
        return res.json({ success: false, message: 'Invalid email or password.' });
    }

    // Set a cookie with user info (simple approach for serverless)
    const userData = JSON.stringify({ name: user.name, email: user.email });
    res.setHeader('Set-Cookie', `user=${encodeURIComponent(userData)}; Path=/; Max-Age=86400; SameSite=Lax`);
    res.json({ success: true, message: 'Login successful!', user: { name: user.name, email: user.email } });
};
