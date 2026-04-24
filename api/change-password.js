const { getDB, saveDB } = require('./db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const cookies = req.headers.cookie || '';
    const userCookie = cookies.split(';').find(c => c.trim().startsWith('user='));
    
    if (!userCookie) return res.status(401).json({ success: false, message: 'Please login.' });
    
    let user;
    try {
        user = JSON.parse(decodeURIComponent(userCookie.split('=').slice(1).join('=')));
    } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid session.' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.json({ success: false, message: 'Both current and new passwords are required.' });
    }

    if (newPassword.length < 6) {
        return res.json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    try {
        const db = await getDB();
        const stmt = db.prepare("SELECT password FROM users WHERE email = ?");
        stmt.bind([user.email]);
        
        if (!stmt.step()) {
            stmt.free();
            return res.json({ success: false, message: 'User not found.' });
        }
        
        const userData = stmt.getAsObject();
        stmt.free();

        if (!bcrypt.compareSync(currentPassword, userData.password)) {
            return res.json({ success: false, message: 'Current password is incorrect.' });
        }

        const hashed = bcrypt.hashSync(newPassword, 10);
        db.run("UPDATE users SET password = ? WHERE email = ?", [hashed, user.email]);
        saveDB();

        res.json({ success: true, message: 'Password changed successfully!' });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to change password.' });
    }
};
