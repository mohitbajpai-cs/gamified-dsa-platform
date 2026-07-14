const friendService = require('../services/friend.service');
const guildService = require('../services/guild.service');
const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class SocialController {
    // -------------------------------------------------------------
    // FRIENDS OPERATIONS
    // -------------------------------------------------------------
    sendFriendRequest = asyncHandler(async (req, res) => {
        const { username } = req.body;
        const request = await friendService.sendFriendRequest(req.user._id, username);
        res.status(200).json(new ApiResponse(200, request, 'Resonance connection request sent'));
    });

    acceptFriendRequest = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const friendship = await friendService.acceptFriendRequest(req.user._id, id);
        res.status(200).json(new ApiResponse(200, friendship, 'Resonance lock established'));
    });

    rejectFriendRequest = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const friendship = await friendService.rejectFriendRequest(req.user._id, id);
        res.status(200).json(new ApiResponse(200, friendship, 'Resonance request severed'));
    });

    removeFriend = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await friendService.removeFriend(req.user._id, id);
        res.status(200).json(new ApiResponse(200, null, 'Resonance connection severed'));
    });

    getFriends = asyncHandler(async (req, res) => {
        const friends = await friendService.getFriends(req.user._id);
        res.status(200).json(new ApiResponse(200, friends, 'Friends list retrieved successfully'));
    });

    getPendingRequests = asyncHandler(async (req, res) => {
        const requests = await friendService.getPendingRequests(req.user._id);
        res.status(200).json(new ApiResponse(200, requests, 'Pending requests retrieved'));
    });

    searchUsers = asyncHandler(async (req, res) => {
        const { q } = req.query;
        const matches = await friendService.searchUsers(req.user._id, q);
        res.status(200).json(new ApiResponse(200, matches, 'User query matches retrieved'));
    });

    // -------------------------------------------------------------
    // GUILD OPERATIONS
    // -------------------------------------------------------------
    createGuild = asyncHandler(async (req, res) => {
        const guild = await guildService.createGuild(req.user._id, req.body);
        res.status(201).json(new ApiResponse(201, guild, 'Guild alliance founded successfully'));
    });

    joinGuild = asyncHandler(async (req, res) => {
        const { inviteCode } = req.body;
        const guild = await guildService.joinGuild(req.user._id, inviteCode);
        res.status(200).json(new ApiResponse(200, guild, 'Joined guild alliance successfully'));
    });

    leaveGuild = asyncHandler(async (req, res) => {
        const result = await guildService.leaveGuild(req.user._id);
        res.status(200).json(new ApiResponse(200, result, 'Deserted guild alliance'));
    });

    transferGuildOwnership = asyncHandler(async (req, res) => {
        const { newOwnerId } = req.body;
        const result = await guildService.transferOwnership(req.user._id, newOwnerId);
        res.status(200).json(new ApiResponse(200, result, 'Alliance mastery transferred'));
    });

    exileGuildMember = asyncHandler(async (req, res) => {
        const { memberId } = req.params;
        const result = await guildService.removeMember(req.user._id, memberId);
        res.status(200).json(new ApiResponse(200, result, 'Member exiled from scrolls'));
    });

    getGuildDetails = asyncHandler(async (req, res) => {
        const details = await guildService.getGuildDetails(req.user._id);
        res.status(200).json(new ApiResponse(200, details, 'Guild credentials loaded'));
    });

    getGuildLeaderboard = asyncHandler(async (req, res) => {
        const board = await guildService.getGuildLeaderboard();
        res.status(200).json(new ApiResponse(200, board, 'Guild leaderboards loaded'));
    });

    // -------------------------------------------------------------
    // NOTIFICATIONS OPERATIONS
    // -------------------------------------------------------------
    getNotifications = asyncHandler(async (req, res) => {
        const list = await notificationService.getNotifications(req.user._id);
        res.status(200).json(new ApiResponse(200, list, 'Notifications synced'));
    });

    markNotificationRead = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await notificationService.markAsRead(id, req.user._id);
        res.status(200).json(new ApiResponse(200, result, 'Notification marked read'));
    });

    markAllNotificationsRead = asyncHandler(async (req, res) => {
        await notificationService.markAllAsRead(req.user._id);
        res.status(200).json(new ApiResponse(200, null, 'All notifications marked read'));
    });

    deleteNotification = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await notificationService.deleteNotification(id, req.user._id);
        res.status(200).json(new ApiResponse(200, null, 'Notification deleted'));
    });

    getUnreadNotificationsCount = asyncHandler(async (req, res) => {
        const count = await notificationService.getUnreadCount(req.user._id);
        res.status(200).json(new ApiResponse(200, { count }, 'Unread count resolved'));
    });
}

module.exports = new SocialController();
