const express = require('express');
const router = express.Router();
const { startInterview, submitAnswer, finishInterview, exitInterview, getHistory } = require('../controllers/interviewController');
const { validate, startSchema, answerSchema, finishSchema } = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');

router.post('/start',   protect, validate(startSchema),  startInterview);
router.post('/answer',  protect, validate(answerSchema), submitAnswer);
router.post('/finish',  protect, validate(finishSchema), finishInterview);
router.post('/exit',    protect, validate(finishSchema), exitInterview);
router.get('/history',  protect, getHistory);

module.exports = router;
