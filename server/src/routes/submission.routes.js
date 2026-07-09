const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const { protect } = require('../middleware/auth.middleware');

// Routes mounted at /api/submission and /api/submissions
router.post('/', protect, submissionController.submit);
router.get('/', protect, submissionController.getHistory);
router.get('/:problemId', protect, submissionController.getProblemHistory);

module.exports = router;
