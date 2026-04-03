const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));
app.use((req, res, next) => {
    console.log(`Global Auth Check: ${req.method} ${req.url} - Auth: ${req.headers.authorization ? 'Yes' : 'No'}`);
    next();
});

// Database Connection State Cache
let isConnected = false;

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    if (isConnected && mongoose.connection.readyState === 1) return next();

    try {
        console.log('Establishing connection to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 8000, // Wait 8s before failing
        });
        isConnected = true;
        console.log('Neural Synapse Established: MongoDB Connected');
        next();
    } catch (err) {
        console.error('CRITICAL: Neural Synapse Failure:', err.message);
        // Only return 503 if it's actually an API request
        if (req.url.startsWith('/api')) {
            return res.status(503).json({
                message: 'Neural Protocol Unavailable',
                error: 'Database connection failed. Please try again in 5 seconds.'
            });
        }
        next();
    }
});

// Basic Route
app.get('/', (req, res) => {
    res.send('QuizMaster API is running...');
});

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const quizRoutes = require('./routes/quiz');
const attemptRoutes = require('./routes/attempt');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling
app.use((err, req, res, next) => {
    console.log('CRITICAL ERROR:', req.method, req.url);
    console.error(err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message
    });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
