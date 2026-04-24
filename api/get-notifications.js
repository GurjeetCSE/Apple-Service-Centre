const { getDB, saveDB } = require('./db');

module.exports = async (req, res) => {
    const cookies = req.headers.cookie || '';
    const userCookie = cookies.split(';').find(c => c.trim().startsWith('user='));
    
    if (!userCookie) return res.status(401).json({ success: false });
    
    let user;
    try {
        user = JSON.parse(decodeURIComponent(userCookie.split('=').slice(1).join('=')));
    } catch (e) {
        return res.status(401).json({ success: false });
    }

    try {
        const db = await getDB();
        
        // Fetch unread notifications
        const stmt = db.prepare("SELECT * FROM notifications WHERE user_email = ? AND is_read = 0 ORDER BY created_at DESC");
        stmt.bind([user.email]);
        
        const notifications = [];
        while (stmt.step()) {
            notifications.push(stmt.getAsObject());
        }
        stmt.free();

        // Mark them as read immediately for this demo
        if (notifications.length > 0) {
            db.run("UPDATE notifications SET is_read = 1 WHERE user_email = ?", [user.email]);
            saveDB();
        }

        res.json({ success: true, notifications });
    } catch (e) {
        res.status(500).json({ success: false });
    }
};
