const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topic.controller');
const { protect } = require('../middleware/auth.middleware');

// Protected topic endpoints
router.get('/:worldId', protect, topicController.getByWorld);

module.exports = router;
