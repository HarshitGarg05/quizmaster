const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Authorization required' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Always check DB to see if user is banned
        const user = await User.findById(decoded.id).select('role isBanned');
        if (!user) return res.status(404).json({ message: 'User no longer exists' });

        if (user.isBanned) {
            return res.status(403).json({ message: 'Access denied: Your account has been suspended.' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth error:', err.message);
        res.status(401).json({ message: 'Session expired or invalid. Please login again.' });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    next();
};

module.exports = { auth, isAdmin };
