const express = require('express');
const router = express.Router();
const adminTestCaseController = require('../controllers/adminTestCase.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Protect all routes to Admin-only
router.use(protect, restrictTo('admin'));

router.get('/', adminTestCaseController.getAll);
router.post('/', adminTestCaseController.create);
router.put('/:id', adminTestCaseController.update);
router.delete('/:id', adminTestCaseController.delete);

module.exports = router;
