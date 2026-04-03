const express = require('express');
const router = express.Router();
const { createAttempt, getAttemptById, getUserAttempts, clearUserHistory } = require('../controllers/attemptController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createAttempt);
router.delete('/clear', auth, clearUserHistory);
router.get('/:id', auth, getAttemptById);
router.get('/user/me', auth, getUserAttempts);

module.exports = router;
