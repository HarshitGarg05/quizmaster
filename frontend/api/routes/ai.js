const express = require('express');
const router = express.Router();
const { generateQuestions } = require('../controllers/aiController');
const { auth, isAdmin } = require('../middleware/auth');

router.post('/generate-questions', auth, isAdmin, generateQuestions);

module.exports = router;
