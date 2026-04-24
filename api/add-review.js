const { getDB, saveDB } = require('./db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const cookies = req.headers.cookie || '';
    const userCookie = cookies.split(';').find(c => c.trim().startsWith('user='));
    
    if (!userCookie) return res.status(401).json({ success: false, message: 'Please login.' });
    
    let user;
    try {
        user = JSON.parse(decodeURIComponent(userCookie.split('=').slice(1).join('=')));
    } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid session.' });
    }

    const { rating, comment } = req.body;
    if (!rating || !comment) {
        return res.json({ success: false, message: 'Rating and comment are required.' });
    }

    try {
        const db = await getDB();
        db.run("INSERT INTO reviews (user_name, rating, comment) VALUES (?, ?, ?)", 
               [user.name, parseInt(rating), comment]);
        saveDB();
        res.json({ success: true, message: 'Thank you for your feedback!' });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to save review.' });
    }
};
