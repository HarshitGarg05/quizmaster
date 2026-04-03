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

        const totalBeforeMultiplier = baseXP + accuracyBonus + timeBonus + streakBonus;
        const xpEarned = Math.round(totalBeforeMultiplier * difficultyMultiplier);

        const attempt = await Attempt.create({
            userId: req.user.id,
            quizId,
            answers,
            score,
            accuracy,
            timeTaken,
            xpEarned,
            xpBreakdown: {
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

        // Proper weighted accuracy over all attempts
        const totalAttemptsCount = user.attempts.length;
        if (totalAttemptsCount === 1) {
            user.accuracy = accuracy;
        } else {
            // New average = (Old Average * (N-1) + New Value) / N
            user.accuracy = Math.round(((user.accuracy * (totalAttemptsCount - 1)) + accuracy) / totalAttemptsCount);
        }

        await user.save();

        // Update Quiz stats
        await Quiz.findByIdAndUpdate(quizId, { $inc: { totalAttempts: 1 } });

        res.status(201).json(attempt);
    } catch (err) {
        res.status(500).json({ message: 'Failed to save attempt', error: err.message });
    }
};

const getAttemptById = async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.id).populate('quizId');
        if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
        res.status(200).json(attempt);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch attempt', error: err.message });
    }
};

const getUserAttempts = async (req, res) => {
    try {
        const attempts = await Attempt.find({ userId: req.user.id }).populate('quizId').sort({ createdAt: -1 });
        res.status(200).json(attempts);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch attempts', error: err.message });
    }
};

module.exports = { createAttempt, getAttemptById, getUserAttempts };
