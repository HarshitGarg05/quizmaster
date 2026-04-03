const express = require('express');
const router = express.Router();
const { createAttempt, getAttemptById, getUserAttempts } = require('../controllers/attemptController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createAttempt);
router.get('/:id', auth, getAttemptById);
router.get('/user/me', auth, getUserAttempts);

module.exports = router;
