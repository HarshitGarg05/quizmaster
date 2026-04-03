const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    console.log('Register request received for:', req.body.email);
    try {
        const { name, email, password, role, avatar } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user exists
        console.log('Querying database for existing user:', normalizedEmail);
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: role || 'User',
            avatar
        });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
            token
        });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
};

const login = async (req, res) => {
    console.log('Login request received for:', req.body.email);
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        console.log('Querying database for user:', normalizedEmail);
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        if (user.isBanned) return res.status(403).json({ message: 'Your account has been suspended' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Update lastActive
        user.lastActive = Date.now();
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                xp: user.xp,
                accuracy: user.accuracy,
                avatar: user.avatar
            },
            token
        });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        if (avatar) user.avatar = avatar;
        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 12);
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                xp: user.xp,
                accuracy: user.accuracy,
                avatar: user.avatar
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Profile update failed', error: err.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const Attempt = require('../models/Attempt');
        await Attempt.deleteMany({ userId: req.user.id });

        await User.findByIdAndDelete(req.user.id);

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Account deletion failed', error: err.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ lastActive: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users', error: err.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        if (userId === req.user.id) return res.status(400).json({ message: 'You cannot change your own role' });

        const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update user role', error: err.message });
    }
};

module.exports = { register, login, updateProfile, deleteAccount, getAllUsers, updateUserRole };
