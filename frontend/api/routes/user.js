const express = require('express');
const router = express.Router();
const Attempt = require('../models/Attempt');
const User = require('../models/User');

// GET /api/users/leaderboard?timeframe=Weekly|Monthly|All%20Time
router.get('/leaderboard', async (req, res) => {
    const { timeframe } = req.query;
    try {
        let dateFilter = {};
        const now = new Date();

        if (timeframe === 'Weekly') {
            dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        } else if (timeframe === 'Monthly') {
            dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
        }

        if (Object.keys(dateFilter).length > 0) {
            // Aggregate XP from attempts within the specific timeframe
            const leaderboard = await Attempt.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: "$userId",
                        xp: { $sum: "$xpEarned" },
                        accuracy: { $avg: "$accuracy" }
                    }
                },
                { $sort: { xp: -1 } },
                { $limit: 25 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                },
                { $unwind: '$userInfo' },
                {
                    $project: {
                        _id: 1,
                        xp: 1,
                        accuracy: 1,
                        name: '$userInfo.name',
                        avatar: '$userInfo.avatar'
                    }
                }
            ]);
            return res.json(leaderboard);
        } else {
            // Default: All Time leaderboard from User collection
            const leaderboard = await User.find({ xp: { $gt: 0 } })
                .sort({ xp: -1 })
                .limit(25)
                .select('name xp accuracy avatar');
            res.json(leaderboard);
        }
    } catch (err) {
        console.error('Leaderboard Error:', err);
        res.status(500).json({ message: 'Failed to fetch leaderboard data' });
    }
});

module.exports = router;
