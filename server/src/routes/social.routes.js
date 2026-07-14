const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { protect } = require('../middleware/auth.middleware');

// Apply protection to all endpoints
router.use(protect);

// -------------------------------------------------------------
// FRIENDS ROUTING
// -------------------------------------------------------------
router.post('/friends/request', socialController.sendFriendRequest);
router.put('/friends/request/:id/accept', socialController.acceptFriendRequest);
router.put('/friends/request/:id/reject', socialController.rejectFriendRequest);
router.delete('/friends/:id', socialController.removeFriend);
router.get('/friends', socialController.getFriends);
router.get('/friends/requests/pending', socialController.getPendingRequests);
router.get('/users/search', socialController.searchUsers);

// -------------------------------------------------------------
// GUILD ROUTING
// -------------------------------------------------------------
router.post('/guilds', socialController.createGuild);
router.post('/guilds/join', socialController.joinGuild);
router.post('/guilds/leave', socialController.leaveGuild);
router.post('/guilds/transfer', socialController.transferGuildOwnership);
router.delete('/guilds/exile/:memberId', socialController.exileGuildMember);
router.get('/guilds/me', socialController.getGuildDetails);
router.get('/guilds/leaderboard', socialController.getGuildLeaderboard);

// -------------------------------------------------------------
// NOTIFICATIONS ROUTING
// -------------------------------------------------------------
router.get('/notifications', socialController.getNotifications);
router.get('/notifications/unread-count', socialController.getUnreadNotificationsCount);
router.put('/notifications/:id/read', socialController.markNotificationRead);
router.put('/notifications/read/all', socialController.markAllNotificationsRead);
router.delete('/notifications/:id', socialController.deleteNotification);

module.exports = router;
