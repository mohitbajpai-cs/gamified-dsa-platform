const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problem.controller');
const { protect } = require('../middleware/auth.middleware');

// Routes mapping to exact endpoints requested:
// GET /api/problems/:topicId
// GET /api/problem/:id
router.get('/problems/:topicId', protect, problemController.getByTopic);
router.get('/problem/:id', protect, problemController.getById);

module.exports = router;
