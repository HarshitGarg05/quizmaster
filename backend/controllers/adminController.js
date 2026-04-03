const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

const getAdminStats = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            totalUsers,
            activeUsersToday,
            totalQuizzes,
            totalAttempts,
            avgScoreResult,
            topCategoryResult,
            dailyAttempts
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ lastActive: { $gte: startOfToday } }),
            Quiz.countDocuments(),
            Attempt.countDocuments(),
            Attempt.aggregate([{ $group: { _id: null, avgScore: { $avg: "$accuracy" } } }]),
            Attempt.aggregate([
                { $lookup: { from: 'quizzes', localField: 'quizId', foreignField: '_id', as: 'quiz' } },
                { $unwind: "$quiz" },
                { $group: { _id: "$quiz.category", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]),
            Attempt.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const dateMap = new Map();
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dateMap.set(d.toISOString().split('T')[0], 0);
        }

        dailyAttempts.forEach(d => {
            if (dateMap.has(d._id)) dateMap.set(d._id, d.count);
        });

        const sortedDaily = Array.from(dateMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        res.status(200).json({
            totalUsers,
            activeUsersToday,
            totalQuizzes,
            totalAttempts,
            averageScore: avgScoreResult[0]?.avgScore || 0,
            topCategory: topCategoryResult[0]?._id || 'N/A',
            dailyAttempts: sortedDaily
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getTopUsers = async (req, res) => {
    try {
        const topUsers = await User.find({})
            .select('name avatar xp role lastActive')
            .sort({ xp: -1 })
            .limit(5);
        res.status(200).json(topUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const toggleBanUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'Admin') return res.status(403).json({ message: 'Cannot ban another admin' });

        user.isBanned = !user.isBanned;
        await user.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const resetUserProgress = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await Attempt.deleteMany({ userId });
        user.xp = 0;
        user.accuracy = 0;
        user.attempts = [];
        await user.save();
        res.status(200).json({ message: 'User progress reset successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const resetLeaderboard = async (req, res) => {
    try {
        await Promise.all([
            User.updateMany({}, { $set: { xp: 0, accuracy: 0, attempts: [] } }),
            Attempt.deleteMany({})
        ]);
        res.status(200).json({ message: 'Leaderboard reset successfully' });
    } catch (err) {
        console.error('Reset Leaderboard Error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAdminStats,
    getTopUsers,
    toggleBanUser,
    resetUserProgress,
    resetLeaderboard
};
