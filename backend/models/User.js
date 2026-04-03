const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'User'], default: 'User' },
    xp: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    avatar: { type: String }, // Base64 or URL
    attempts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attempt' }],
    lastActive: { type: Date, default: Date.now },
    isBanned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
