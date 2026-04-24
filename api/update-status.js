const { getDB, saveDB } = require('./db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const { repairId, newStatus } = req.body;
    if (!repairId || !newStatus) {
        return res.json({ success: false, message: 'Repair ID and status are required.' });
    }

    try {
        const db = await getDB();
        
        // Get user_email for this repair to send notification
        const stmt = db.prepare("SELECT user_email, device_type FROM repairs WHERE id = ?");
        stmt.bind([repairId]);
        if (stmt.step()) {
            const repair = stmt.getAsObject();
            const message = `Your ${repair.device_type} repair status has been updated to: ${newStatus}`;
            db.run("INSERT INTO notifications (user_email, message) VALUES (?, ?)", [repair.user_email, message]);
        }
        stmt.free();

        db.run("UPDATE repairs SET status = ? WHERE id = ?", [newStatus, repairId]);
        saveDB();
        res.json({ success: true, message: 'Status updated successfully!' });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to update status.' });
    }
};
