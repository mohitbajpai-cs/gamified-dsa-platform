const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contest.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Public endpoints
router.get('/', protect, contestController.getAll);
router.get('/history', protect, contestController.getHistory);
router.get('/:id', protect, contestController.getById);
router.get('/:id/leaderboard', protect, contestController.getLeaderboard);

// Registration & Gameplay
router.post('/register', protect, contestController.register);
router.post('/start', protect, contestController.start);
router.post('/submit', protect, contestController.submit);

// Admin / Moderator CRUD
router.post('/admin', protect, restrictTo('admin', 'moderator'), contestController.create);
router.put('/admin/:id', protect, restrictTo('admin', 'moderator'), contestController.update);
router.delete('/admin/:id', protect, restrictTo('admin'), contestController.delete); // Admin only can delete contests!

module.exports = router;
