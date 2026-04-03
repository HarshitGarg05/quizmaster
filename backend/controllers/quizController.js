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
        res.status(200).json(quizzes);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch quizzes', error: err.message });
    }
};

const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.status(200).json(quiz);
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
