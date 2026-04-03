const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String },
    section: { type: String, default: 'General' }
});

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    timeLimit: { type: Number, required: true }, // in minutes
    marksPerQuestion: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalAttempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
