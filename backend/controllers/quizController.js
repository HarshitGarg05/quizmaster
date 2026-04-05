const Quiz = require('../models/Quiz');

const createQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.create({
            ...req.body,
            createdBy: req.user.id
        });
        res.status(201).json(quiz);
    } catch (err) {
        console.error('Quiz creation error:', err);
        res.status(500).json({ message: 'Failed to create quiz', error: err.message });
    }
};

const getAllQuizzes = async (req, res) => {
    try {
        const { category, difficulty, search } = req.query;
        let query = {};
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const quizzes = await Quiz.find(query).sort({ createdAt: -1 });

        // Map hasAttempted flag if user is logged in
        let quizzeswithStatus = quizzes.map(q => q.toObject());
        if (req.user) {
            const attemptedQuizIds = new Set(req.user.maidenQuizzes.map(id => id.toString()));
            quizzeswithStatus = quizzeswithStatus.map(q => ({
                ...q,
                hasAttempted: attemptedQuizIds.has(q._id.toString())
            }));
        }

        res.status(200).json(quizzeswithStatus);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch quizzes', error: err.message });
    }
};

const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const hasAttempted = req.user.maidenQuizzes?.some(id => id.toString() === req.params.id) || false;

        res.status(200).json({
            ...quiz.toObject(),
            hasAttempted
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch quiz', error: err.message });
    }
};

const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.status(200).json(quiz);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update quiz', error: err.message });
    }
};

module.exports = { createQuiz, getAllQuizzes, getQuizById, updateQuiz };
