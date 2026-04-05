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
            dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
        } else if (timeframe === 'Monthly') {
            dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
        }

        let leaders;
        if (Object.keys(dateFilter).length > 0) {
            leaders = await Attempt.aggregate([
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
                    $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' }
                },
                { $unwind: '$userInfo' },
                {
                    $project: {
                        _id: 1, xp: 1, accuracy: 1,
                        name: '$userInfo.name', avatar: '$userInfo.avatar'
                    }
                }
            ]);
        } else {
            leaders = await User.find({ xp: { $gt: 0 } })
                .sort({ xp: -1 })
                .limit(25)
                .select('name xp accuracy avatar');
        }

        res.json({ leaders });

    } catch (err) {
        console.error('Leaderboard Error:', err);
        res.status(500).json({ message: 'Failed to fetch leaderboard data' });
    }
});

module.exports = router;
