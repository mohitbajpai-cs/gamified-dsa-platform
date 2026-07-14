const express = require('express');
const router = express.Router();
const bossController = require('../controllers/boss.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/rewards', protect, bossController.getBossRewards);
router.get('/:realmId', protect, bossController.getBossByRealmId);
router.post('/submit', protect, bossController.submitBossSolution);

module.exports = router;
