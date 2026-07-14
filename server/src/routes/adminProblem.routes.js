const express = require('express');
const router = express.Router();
const adminProblemController = require('../controllers/adminProblem.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Protect all routes to Admin-only
router.use(protect, restrictTo('admin', 'moderator'));

router.get('/', adminProblemController.getAll);
router.post('/', adminProblemController.create);
router.put('/:id', adminProblemController.update);
router.delete('/:id', adminProblemController.delete);

module.exports = router;
