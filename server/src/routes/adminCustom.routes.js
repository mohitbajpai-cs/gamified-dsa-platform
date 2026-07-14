const express = require('express');
const router = express.Router();
const adminCustomController = require('../controllers/adminCustom.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Protect all routes to Admin or Moderator roles
router.use(protect, restrictTo('admin', 'moderator'));

// Analytics / Stats
router.get('/dashboard/stats', adminCustomController.getStats);
router.get('/dashboard/analytics', adminCustomController.getAnalytics);

// User Management
router.get('/users', adminCustomController.getUsers);
router.put('/users/:id/role', adminCustomController.updateUserRole);
router.post('/users/:id/reset-xp', adminCustomController.resetXp);
router.post('/users/:id/reset-coins', adminCustomController.resetCoins);
router.post('/users/:id/reset-progress', adminCustomController.resetProgress);
router.delete('/users/:id', restrictTo('admin'), adminCustomController.deleteUser); // Admin only can delete users!

// Quests CRUD
router.get('/quests', adminCustomController.getQuests);
router.post('/quests', adminCustomController.createQuest);
router.put('/quests/:id', adminCustomController.updateQuest);
router.delete('/quests/:id', adminCustomController.deleteQuest);

// Achievements CRUD
router.get('/achievements', adminCustomController.getAchievements);
router.post('/achievements', adminCustomController.createAchievement);
router.put('/achievements/:id', adminCustomController.updateAchievement);
router.delete('/achievements/:id', adminCustomController.deleteAchievement);

// Bosses CRUD
router.get('/bosses', adminCustomController.getBosses);
router.post('/bosses', adminCustomController.createBoss);
router.put('/bosses/:id', adminCustomController.updateBoss);
router.delete('/bosses/:id', adminCustomController.deleteBoss);

module.exports = router;
