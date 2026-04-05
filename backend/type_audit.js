const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Attempt = require('./models/Attempt');

async function audit() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const userEmails = ['garg.harshit3105@gmail.com', 'princeshampo7@gmail.com', 'gargvibhor2008@gmail.com'];

        for (const email of userEmails) {
            const user = await User.findOne({ email });
            if (user) {
                console.log(`\nUser: ${user.email}`);
                console.log(`   ID: ${user._id}`);
                console.log(`   XP in User Doc: ${user.xp}`);

                const attempts = await Attempt.find({ userId: user._id });
                const xpSum = attempts.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
                console.log(`   Sum of XP from ${attempts.length} attempts: ${xpSum}`);

                if (user.xp === xpSum) {
                    console.log(`   STATUS: XP is synchronized with attempts.`);
                } else {
                    console.log(`   STATUS: XP DISCREPANCY! User XP=${user.xp} vs Sum=${xpSum}`);
                }
            }
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

audit();
