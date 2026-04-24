const { getDB } = require('./db');

module.exports = async (req, res) => {
    // For this demonstration, we'll allow fetching all repairs.
    // In a production app, you would check for an 'admin' flag on the user.
    
    try {
        const db = await getDB();
        const stmt = db.prepare("SELECT * FROM repairs ORDER BY created_at DESC");
        
        const repairs = [];
        while (stmt.step()) {
            repairs.push(stmt.getAsObject());
        }
        stmt.free();

        res.json({ success: true, repairs });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to fetch repairs.' });
    }
};
