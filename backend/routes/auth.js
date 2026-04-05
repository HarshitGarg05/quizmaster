const express = require('express');
const router = express.Router();
const { register, login, updateProfile, deleteAccount, getProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.get('/me', auth, getProfile);
router.post('/register', register);
router.post('/login', login);
router.put('/profile', auth, updateProfile);
router.delete('/profile', auth, deleteAccount);

module.exports = router;
