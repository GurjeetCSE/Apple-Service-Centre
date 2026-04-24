const { getDB, saveDB } = require('./db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.json({ success: false, message: 'Required fields are missing.' });
    }

    try {
        const db = await getDB();
        db.run("INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)", [name, email, subject, message]);
        saveDB();
        res.json({ 
            success: true, 
            message: 'Your message has been received! We will get back to you shortly.' 
        });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
};
