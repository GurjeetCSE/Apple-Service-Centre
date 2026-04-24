const { getDB, saveDB } = require('./db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const { repairId, newStatus } = req.body;
    if (!repairId || !newStatus) {
        return res.json({ success: false, message: 'Repair ID and status are required.' });
    }

    try {
        const db = await getDB();
        db.run("UPDATE repairs SET status = ? WHERE id = ?", [newStatus, repairId]);
        saveDB();
        res.json({ success: true, message: 'Status updated successfully!' });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to update status.' });
    }
};
