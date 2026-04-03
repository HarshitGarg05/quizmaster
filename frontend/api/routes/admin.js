const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole } = require('../controllers/authController');
const {
    getAdminStats,
    getTopUsers,
    toggleBanUser,
    resetUserProgress,
    resetLeaderboard
} = require('../controllers/adminController');
const { auth, isAdmin } = require('../middleware/auth');

// Protected admin routes
router.get('/users', auth, isAdmin, getAllUsers);
router.put('/users/role', auth, isAdmin, updateUserRole);

// Extended admin actions
router.get('/stats', auth, isAdmin, getAdminStats);
router.get('/top-users', auth, isAdmin, getTopUsers);
router.put('/users/:userId/ban', auth, isAdmin, toggleBanUser);
router.delete('/users/:userId/reset', auth, isAdmin, resetUserProgress);
router.delete('/leaderboard/reset', auth, isAdmin, resetLeaderboard);

module.exports = router;
