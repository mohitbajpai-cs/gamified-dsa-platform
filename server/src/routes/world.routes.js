const express = require('express');
const router = express.Router();
const worldController = require('../controllers/world.controller');
const { protect } = require('../middleware/auth.middleware');

// Protected world endpoints
router.get('/', protect, worldController.getAll);
router.get('/:id', protect, worldController.getById);

module.exports = router;
