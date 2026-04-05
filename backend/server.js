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

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Database Connected Successfully'))
    .catch(err => console.error('CRITICAL: Database Connection Failure:', err.message));

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
