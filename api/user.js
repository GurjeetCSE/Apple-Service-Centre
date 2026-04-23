module.exports = (req, res) => {
    const cookies = req.headers.cookie || '';
    const userCookie = cookies.split(';').find(c => c.trim().startsWith('user='));

    if (userCookie) {
        try {
            const userData = JSON.parse(decodeURIComponent(userCookie.split('=').slice(1).join('=')));
            return res.json({ loggedIn: true, user: userData });
        } catch (e) {
            // Invalid cookie
        }
    }
    res.json({ loggedIn: false });
};
