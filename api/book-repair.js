const { getDB, saveDB } = require('./db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    // Get user from cookie
    const cookies = req.headers.cookie || '';
    const userCookie = cookies.split(';').find(c => c.trim().startsWith('user='));
    
    if (!userCookie) return res.status(401).json({ success: false, message: 'Please login to book a repair.' });
    
    let user;
    try {
        user = JSON.parse(decodeURIComponent(userCookie.split('=').slice(1).join('=')));
    } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid session.' });
    }

    const { deviceType, model, issue } = req.body;
    if (!deviceType || !model || !issue) {
        return res.json({ success: false, message: 'All fields are required.' });
    }

    const db = await getDB();
    db.run("INSERT INTO repairs (user_email, device_type, model, issue) VALUES (?, ?, ?, ?)", 
           [user.email, deviceType, model, issue]);
    saveDB();

    res.json({ success: true, message: 'Repair booked successfully! Check your profile for updates.' });
};
