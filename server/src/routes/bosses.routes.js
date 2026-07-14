const express = require('express');
const router = express.Router();
const bossController = require('../controllers/boss.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, bossController.getAllBosses);

module.exports = router;
