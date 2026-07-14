const express = require('express');
const router = express.Router();
const questController = require('../controllers/quest.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, questController.getAchievements);

module.exports = router;
