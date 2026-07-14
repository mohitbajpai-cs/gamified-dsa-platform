const express = require('express');
const router = express.Router();
const adminTopicController = require('../controllers/adminTopic.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Protect all routes to Admin-only
router.use(protect, restrictTo('admin', 'moderator'));

router.get('/', adminTopicController.getAll);
router.post('/', adminTopicController.create);
router.put('/:id', adminTopicController.update);
router.delete('/:id', adminTopicController.delete);

module.exports = router;
