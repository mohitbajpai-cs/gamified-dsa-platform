const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

// Protected progress logs endpoint
router.get('/', protect, progressController.get);

module.exports = router;
