const express = require('express');
const router = express.Router();
const questController = require('../controllers/quest.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/daily', protect, questController.getDailyQuests);
router.get('/weekly', protect, questController.getWeeklyQuests);
router.post('/claim', protect, questController.claimQuestReward);

module.exports = router;
