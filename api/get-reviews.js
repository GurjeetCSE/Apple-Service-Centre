const { getDB } = require('./db');

module.exports = async (req, res) => {
    try {
        const db = await getDB();
        const stmt = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 6");
        
        const reviews = [];
        while (stmt.step()) {
            reviews.push(stmt.getAsObject());
        }
        stmt.free();

        res.json({ success: true, reviews });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
    }
};
