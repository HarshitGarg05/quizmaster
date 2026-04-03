const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { auth, isAdmin } = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Attempt = require('../models/Attempt');

// Admin Stats/List (Must be before dynamic :id routes)
router.get('/admin/list', auth, isAdmin, quizController.getAllQuizzes);
// Public Platform Stats for Landing Page
router.get('/public/stats', async (req, res) => {
    try {
        const [totalQuizzes, totalUsers, totalAttempts, totalXPResult] = await Promise.all([
            Quiz.countDocuments(),
            User.countDocuments(),
            Attempt.countDocuments(),
            User.aggregate([{ $group: { _id: null, totalXP: { $sum: "$xp" } } }])
        ]);

        res.status(200).json({
            totalUsers,
            totalQuizzes,
            totalAttempts,
            totalXP: totalXPResult[0]?.totalXP || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// General CRUD
router.get('/', quizController.getAllQuizzes);
router.post('/', auth, isAdmin, quizController.createQuiz);
router.get('/:id', quizController.getQuizById);
router.put('/:id', auth, isAdmin, quizController.updateQuiz);
router.delete('/:id', auth, isAdmin, async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Quiz deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
