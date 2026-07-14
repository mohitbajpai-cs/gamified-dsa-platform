const express = require('express');
const router = express.Router();
const questController = require('../controllers/quest.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/daily', protect, questController.claimDailyLoginReward);

module.exports = router;
