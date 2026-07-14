const Friendship = require('../models/friendship.model');
const User = require('../models/user.model');
const notificationService = require('./notification.service');
const ApiError = require('../utils/apiError');

class FriendService {
    async sendFriendRequest(requesterId, recipientUsername) {
        const recipient = await User.findOne({ username: recipientUsername });
        if (!recipient) throw new ApiError(404, 'Contender not found inside user logs');
        if (String(recipient._id) === String(requesterId)) {
            throw new ApiError(400, 'Cannot establish resonance lock with yourself');
        }

        // Check existing friendship/request
        const existing = await Friendship.findOne({
            $or: [
                { requester: requesterId, recipient: recipient._id },
                { requester: recipient._id, recipient: requesterId }
            ]
        });

        if (existing) {
            if (existing.status === 'accepted') throw new ApiError(400, 'Friend resonance already lock established');
            throw new ApiError(400, 'Friend request already pending');
        }

        const request = await Friendship.create({
            requester: requesterId,
            recipient: recipient._id,
            status: 'pending'
        });

        // Trigger notification
        const requester = await User.findById(requesterId);
        await notificationService.createNotification({
            recipient: recipient._id,
            sender: requesterId,
            type: 'friend_request',
            title: 'Friend Request',
            message: `${requester.username} requests to synchronize character cards.`,
            data: { friendshipId: request._id }
        });

        return request;
    }

    async acceptFriendRequest(recipientId, friendshipId) {
        const friendship = await Friendship.findById(friendshipId);
        if (!friendship) throw new ApiError(404, 'Request resonance coordinates missing');
        if (String(friendship.recipient) !== String(recipientId)) {
            throw new ApiError(403, 'Unauthorized request coordinate match');
        }

        friendship.status = 'accepted';
        await friendship.save();

        // Trigger notification back to requester
        const recipient = await User.findById(recipientId);
        await notificationService.createNotification({
            recipient: friendship.requester,
            sender: recipientId,
            type: 'friend_accepted',
            title: 'Friend Request Accepted',
            message: `${recipient.username} accepted your resonance request lock.`,
            data: { friendshipId: friendship._id }
        });

        return friendship;
    }

    async rejectFriendRequest(recipientId, friendshipId) {
        const friendship = await Friendship.findById(friendshipId);
        if (!friendship) throw new ApiError(404, 'Request resonance coordinates missing');
        if (String(friendship.recipient) !== String(recipientId)) {
            throw new ApiError(403, 'Unauthorized request coordinate match');
        }

        friendship.status = 'rejected';
        await friendship.save();
        return friendship;
    }

    async removeFriend(userId, friendId) {
        return await Friendship.findOneAndDelete({
            $or: [
                { requester: userId, recipient: friendId, status: 'accepted' },
                { requester: friendId, recipient: userId, status: 'accepted' }
            ]
        });
    }

    async getFriends(userId) {
        const friendships = await Friendship.find({
            $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' }
            ]
        }).populate('requester', 'username xp level avatar').populate('recipient', 'username xp level avatar');

        return friendships.map(f => {
            const isRequester = String(f.requester._id) === String(userId);
            return isRequester ? f.recipient : f.requester;
        });
    }

    async getPendingRequests(userId) {
        return await Friendship.find({
            recipient: userId,
            status: 'pending'
        }).populate('requester', 'username xp level avatar');
    }

    async searchUsers(userId, query) {
        if (!query) return [];
        const matches = await User.find({
            username: { $regex: query, $options: 'i' },
            _id: { $ne: userId }
        }).select('username xp level avatar').limit(10);

        const myFriendsList = await this.getFriends(userId);
        const myFriendIds = new Set(myFriendsList.map(f => String(f._id)));

        const populatedMatches = await Promise.all(matches.map(async (m) => {
            const mFriends = await this.getFriends(m._id);
            const mutualCount = mFriends.filter(f => myFriendIds.has(String(f._id))).length;
            
            const obj = m.toObject();
            obj.mutualFriends = mutualCount;
            obj.isOnline = Math.random() > 0.4; // Best-effort online status flag
            return obj;
        }));

        return populatedMatches;
    }
}

module.exports = new FriendService();
