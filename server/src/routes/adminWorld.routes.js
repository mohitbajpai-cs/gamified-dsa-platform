const express = require('express');
const router = express.Router();
const adminWorldController = require('../controllers/adminWorld.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Protect all routes to Admin-only
router.get('/', protect, restrictTo('admin', 'moderator'), adminWorldController.getAll);
router.post('/', protect, restrictTo('admin', 'moderator'), adminWorldController.create);
router.put('/:id', protect, restrictTo('admin', 'moderator'), adminWorldController.update);
router.delete('/:id', protect, restrictTo('admin'), adminWorldController.delete);

module.exports = router;
