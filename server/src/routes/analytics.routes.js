const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Apply protection to all endpoints
router.use(protect);

router.get('/user', analyticsController.getUserAnalytics);
router.get('/activity', analyticsController.getActivityAnalytics);
router.get('/topic-mastery', analyticsController.getTopicMasteryAnalytics);

// Admin-only global stats
router.get('/admin', restrictTo('admin', 'moderator'), analyticsController.getAdminAnalytics);

module.exports = router;
