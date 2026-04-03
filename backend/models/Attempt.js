const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [{
        questionId: { type: String },
        userAnswer: { type: String },
        isCorrect: { type: Boolean }
    }],
    score: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeTaken: { type: Number, required: true }, // in seconds
    xpEarned: { type: Number, default: 0 },
    xpBreakdown: {
        baseXP: { type: Number, default: 0 },
        accuracyBonus: { type: Number, default: 0 },
        timeBonus: { type: Number, default: 0 },
        streakBonus: { type: Number, default: 0 },
        difficultyMultiplier: { type: Number, default: 1 }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attempt', attemptSchema);
