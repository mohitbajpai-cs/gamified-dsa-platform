const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seed.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Protected admin seeder route
router.post('/', protect, restrictTo('admin'), seedController.runSeed);

module.exports = router;
