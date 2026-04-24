const { getDB } = require('./db');

module.exports = async (req, res) => {
    try {
        const db = await getDB();
        const stmt = db.prepare("SELECT * FROM contacts ORDER BY created_at DESC");
        
        const contacts = [];
        while (stmt.step()) {
            contacts.push(stmt.getAsObject());
        }
        stmt.free();

        res.json({ success: true, contacts });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to fetch contact messages.' });
    }
};
