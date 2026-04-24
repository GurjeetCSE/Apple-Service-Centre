const { getDB, saveDB } = require('./db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false });

    const { key, value } = req.body;
    if (!key || !value) return res.json({ success: false });

    try {
        const db = await getDB();
        db.run("UPDATE settings SET value = ? WHERE key = ?", [value, key]);
        saveDB();
        res.json({ success: true, message: 'Settings updated!' });
    } catch (e) {
        res.status(500).json({ success: false });
    }
};
