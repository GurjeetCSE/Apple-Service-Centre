const { getDB, saveDB } = require('./db');

module.exports = async (req, res) => {
    // Basic Admin check (should be improved with sessions in production)
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const { id } = req.body;
    if (!id) return res.json({ success: false, message: 'Message ID is required.' });

    try {
        const database = await getDB();
        database.run("DELETE FROM contacts WHERE id = ?", [id]);
        saveDB();
        res.json({ success: true, message: 'Message deleted successfully.' });
    } catch (e) {
        res.json({ success: false, message: 'Failed to delete message.' });
    }
};
