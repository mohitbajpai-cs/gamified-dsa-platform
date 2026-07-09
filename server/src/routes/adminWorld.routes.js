const express = require('express');
const router = express.Router();
const adminWorldController = require('../controllers/adminWorld.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Protect all routes to Admin-only
router.use(protect, restrictTo('admin'));

router.get('/', adminWorldController.getAll);
router.post('/', adminWorldController.create);
router.put('/:id', adminWorldController.update);
router.delete('/:id', adminWorldController.delete);

module.exports = router;
