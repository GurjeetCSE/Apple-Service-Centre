const { getDB } = require('./db');

module.exports = async (req, res) => {
    // Get user from cookie
    const cookies = req.headers.cookie || '';
    const userCookie = cookies.split(';').find(c => c.trim().startsWith('user='));
    
    if (!userCookie) return res.status(401).json({ success: false, message: 'Please login.' });
    
    let user;
    try {
        user = JSON.parse(decodeURIComponent(userCookie.split('=').slice(1).join('=')));
    } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid session.' });
    }

    const db = await getDB();
    const stmt = db.prepare("SELECT * FROM repairs WHERE user_email = ? ORDER BY created_at DESC");
    stmt.bind([user.email]);
    
    const repairs = [];
    while (stmt.step()) {
        repairs.push(stmt.getAsObject());
    }
    stmt.free();

    res.json({ success: true, repairs });
};
