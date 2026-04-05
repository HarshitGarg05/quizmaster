const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Attempt = require('./models/Attempt');

const syncMerit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB for Merit Sync...');

        const users = await User.find({});
        console.log(`🔍 Found ${users.length} users. Recalculating merit...`);

        for (const user of users) {
            // Aggregate all XP from this user's attempts (hidden or not)
            const attempts = await Attempt.find({ userId: user._id });

            // All-Time XP: Sum of all maiden-like attempts if they had XP
            const totalXP = attempts.reduce((acc, curr) => acc + (curr.xpEarned || 0), 0);

            // Accuracy: Avg of all attempts if they had accuracy
            const maidenAttempts = attempts.filter(a => a.xpEarned > 0 || (user.maidenQuizzes && user.maidenQuizzes.includes(a.quizId)));

            let avgAccuracy = 0;
            if (maidenAttempts.length > 0) {
                avgAccuracy = Math.round(maidenAttempts.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / maidenAttempts.length);
            } else if (attempts.length > 0) {
                avgAccuracy = Math.round(attempts.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / attempts.length);
            }

            // Sync maidenQuizzes array if missing
            const maidenQuizzes = maidenAttempts.map(a => a.quizId.toString());
            const uniqueMaidenQuizzes = [...new Set([...(user.maidenQuizzes || []).map(q => q.toString()), ...maidenQuizzes])];

            await User.findByIdAndUpdate(user._id, {
                xp: totalXP,
                accuracy: avgAccuracy,
                maidenQuizzes: uniqueMaidenQuizzes
            });

            console.log(`✅ Synced ${user.name}: ${totalXP} XP, ${avgAccuracy}% Accuracy.`);
        }

        console.log('🎉 Merit synchronization complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync Error:', err);
        process.exit(1);
    }
};

syncMerit();
