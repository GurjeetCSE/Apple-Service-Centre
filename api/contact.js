module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.json({ success: false, message: 'Required fields are missing.' });
    }

    // In a real app, you would send an email or save to a database here.
    // For this demonstration, we'll simulate a successful submission.
    console.log(`New contact message from ${name} (${email}): ${message}`);

    res.json({ 
        success: true, 
        message: 'Your message has been received! We will get back to you shortly.' 
    });
};
