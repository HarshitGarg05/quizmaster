const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const User = require('../backend/models/User');
const Quiz = require('../backend/models/Quiz');
const Attempt = require('../backend/models/Attempt');

async function audit() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const latestAttempts = await Attempt.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email').populate('quizId', 'title');

        console.log('\n--- LATEST ATTEMPTS ---');
        latestAttempts.forEach(a => {
            console.log(`User: ${a.userId?.email} | Quiz: ${a.quizId?.title} | XP: ${a.xpEarned} | Created: ${a.createdAt}`);
        });

        const usersWithMultipleAttempts = await Attempt.aggregate([
            { $group: { _id: { userId: "$userId", quizId: "$quizId" }, count: { $sum: 1 }, totalXP: { $sum: "$xpEarned" } } },
            { $match: { count: { $gt: 1 } } }
        ]);

        console.log('\n--- RETAKE VIOLATIONS (Multiple attempts for same quiz) ---');
        for (const v of usersWithMultipleAttempts) {
            const u = await User.findById(v._id.userId);
            const q = await Quiz.findById(v._id.quizId);
            console.log(`User: ${u?.email} | Quiz: ${q?.title} | Count: ${v.count} | Total XP from these attempts: ${v.totalXP}`);
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

audit();
