const { getDB } = require('./db');

module.exports = async (req, res) => {
    try {
        const db = await getDB();
        const stmt = db.prepare("SELECT value FROM settings WHERE key = 'maintenance_mode'");
        
        let maintenanceMode = 'off';
        if (stmt.step()) {
            maintenanceMode = stmt.getAsObject().value;
        }
        stmt.free();

        res.json({ success: true, maintenanceMode });
    } catch (e) {
        res.status(500).json({ success: false });
    }
};
