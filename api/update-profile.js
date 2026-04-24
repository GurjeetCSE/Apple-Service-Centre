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

    const { name } = req.body;
    if (!name) {
        return res.json({ success: false, message: 'Name is required.' });
    }

    try {
        const db = await getDB();
        db.run("UPDATE users SET name = ? WHERE email = ?", [name, user.email]);
        saveDB();

        // Update the cookie with the new name
        const updatedUser = { name, email: user.email };
        const userData = JSON.stringify(updatedUser);
        res.setHeader('Set-Cookie', `user=${encodeURIComponent(userData)}; Path=/; Max-Age=86400; SameSite=Lax`);

        res.json({ success: true, message: 'Profile updated successfully!', user: updatedUser });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
};
