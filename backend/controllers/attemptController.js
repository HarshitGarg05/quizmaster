const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

const createAttempt = async (req, res) => {
    try {
        const { quizId, answers, score, accuracy, timeTaken } = req.body;
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // 1. Base XP (+10 per correct answer)
        const correctCount = answers.filter(a => a.isCorrect).length;
        const baseXP = correctCount * 10;

        // 2. Accuracy Bonus
        let accuracyBonus = 0;
        if (accuracy === 100) accuracyBonus = 50;
        else if (accuracy >= 80) accuracyBonus = 30;
        else if (accuracy >= 60) accuracyBonus = 15;

        // 3. Time Bonus (Only if accuracy >= 60%)
        let timeBonus = 0;
        if (accuracy >= 60) {
            const totalTimeSeconds = quiz.timeLimit * 60;
            const timeLeft = Math.max(0, totalTimeSeconds - timeTaken);
            const timeRatio = timeLeft / totalTimeSeconds;

            if (timeRatio >= 0.5) timeBonus = 40;
            else if (timeRatio >= 0.3) timeBonus = 25;
            else if (timeRatio >= 0.1) timeBonus = 10;
        }

        // 4. Streak Bonus (Highest milestone per consecutive streak)
        const streaks = [];
        let currentStreakCount = 0;
        answers.forEach(a => {
            if (a.isCorrect) {
                currentStreakCount++;
            } else {
                if (currentStreakCount > 0) streaks.push(currentStreakCount);
                currentStreakCount = 0;
            }
        });
        if (currentStreakCount > 0) streaks.push(currentStreakCount);

        let streakBonus = 0;
        streaks.forEach(s => {
            if (s >= 10) streakBonus += 50;
            else if (s >= 5) streakBonus += 20;
            else if (s >= 3) streakBonus += 10;
        });

        // 5. Difficulty Multiplier
        let difficultyMultiplier = 1.0;
        if (quiz.difficulty === 'Medium') difficultyMultiplier = 1.2;
        else if (quiz.difficulty === 'Hard') difficultyMultiplier = 1.5;

        // 6. Check for Retake (Zero XP for subsequent attempts)
        const fs = require('fs');
        const path = require('path');
        const mongoose = require('mongoose');
        const logPath = path.join(process.cwd(), 'XPGUARD_DEBUG.txt');
        const castQuizId = new mongoose.Types.ObjectId(quizId);

        const allMatches = await Attempt.find({
            userId: req.user._id,
            quizId: castQuizId
        }).lean();
        let previousAttempt = allMatches.length > 0 ? allMatches[0] : null;

        // PERSISTENT GUARD: If history was cleared, check the maidenQuizzes array in User model
        if (!previousAttempt) {
            const userForPersistentCheck = await User.findById(req.user._id).select('maidenQuizzes').lean();
            if (userForPersistentCheck?.maidenQuizzes?.some(id => id.toString() === quizId.toString())) {
                previousAttempt = { _id: 'PERSISTENT_GUARD_RECORD' }; // Synthetic record to trigger XP neutralization
            }
        }

        const logMsg = `[XP_AUDIT] User: ${req.user._id} | Quiz: ${quizId} | Match Count: ${allMatches.length} | Found: ${!!previousAttempt} | Points: ${previousAttempt ? 0 : 'NEW'} | Time: ${new Date().toISOString()}\n`;
        fs.appendFileSync(logPath, logMsg);

        const totalBeforeMultiplier = baseXP + accuracyBonus + timeBonus + streakBonus;
        // Apply XP only if no previous attempt exists
        const xpEarned = previousAttempt ? 0 : Math.round(totalBeforeMultiplier * difficultyMultiplier);

        // Cap history at 10: Delete oldest if we reach 10
        const userAttemptsCount = await Attempt.countDocuments({ userId: req.user.id });
        if (userAttemptsCount >= 10) {
            const oldestAttempt = await Attempt.findOne({ userId: req.user.id }).sort({ createdAt: 1 });
            if (oldestAttempt) {
                await Attempt.findByIdAndDelete(oldestAttempt._id);
                // Also remove from user.attempts array in the user document
                await User.findByIdAndUpdate(req.user.id, { $pull: { attempts: oldestAttempt._id } });
            }
        }

        const attempt = await Attempt.create({
            userId: req.user._id,
            quizId,
            answers,
            score,
            accuracy,
            timeTaken,
            xpEarned,
            xpBreakdown: previousAttempt ? {
                baseXP: 0,
                accuracyBonus: 0,
                timeBonus: 0,
                streakBonus: 0,
                difficultyMultiplier: 1
            } : {
                baseXP,
                accuracyBonus,
                timeBonus,
                streakBonus,
                difficultyMultiplier
            }
        });

        // Update User XP and Accuracy
        const user = await User.findById(req.user.id);
        user.xp += xpEarned;

        // Push attempt to tracking
        user.attempts.push(attempt._id);

        // PERSISTENCE PROTOCOL: Record maiden attempt if it's the first time
        if (xpEarned > 0 || !user.maidenQuizzes.some(id => id.toString() === quizId.toString())) {
            const isFirstAttempt = !user.maidenQuizzes.some(id => id.toString() === quizId.toString());

            if (isFirstAttempt) {
                user.maidenQuizzes.push(castQuizId);

                // Only update lifetime accuracy on maiden attempts
                const n = user.maidenQuizzes.length;
                if (n === 1) {
                    user.accuracy = accuracy;
                } else {
                    // Weighted average for maiden attempts only
                    user.accuracy = Math.round(((user.accuracy * (n - 1)) + accuracy) / n);
                }
            }
        }

        await user.save();

        // Update Quiz stats
        await Quiz.findByIdAndUpdate(quizId, { $inc: { totalAttempts: 1 } });

        res.status(201).json({
            ...attempt.toObject(),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                xp: user.xp,
                accuracy: user.accuracy,
                avatar: user.avatar,
                maidenQuizzes: user.maidenQuizzes
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save attempt', error: err.message });
    }
};

const getAttemptById = async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.id)
            .populate('quizId')
            .lean(); // Use lean for easier object merging
        if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

        // Also fetch user to sync stats
        const user = await User.findById(attempt.userId).select('name email role xp accuracy avatar maidenQuizzes').lean();

        res.status(200).json({
            ...attempt,
            user
        });
    } catch (err) {
        console.error('Fetch Attempt Error:', err);
        res.status(500).json({ message: 'Failed to fetch attempt', error: err.message });
    }
};

const getUserAttempts = async (req, res) => {
    try {
        const attempts = await Attempt.find({ userId: req.user.id, isHidden: false }).populate('quizId').sort({ createdAt: -1 });
        res.status(200).json(attempts);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch attempts', error: err.message });
    }
};

const clearUserHistory = async (req, res) => {
    try {
        // Soft delete: hide from dashboard but keep for leaderboard statistics
        await Attempt.updateMany({ userId: req.user.id }, { $set: { isHidden: true } });
        // NOTE: We do NOT clear maidenQuizzes here to maintain reward integrity even after history is wiped
        await User.findByIdAndUpdate(req.user.id, { $set: { attempts: [] } });
        res.status(200).json({ message: 'History cleared successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to clear history', error: err.message });
    }
};

module.exports = { createAttempt, getAttemptById, getUserAttempts, clearUserHistory };
