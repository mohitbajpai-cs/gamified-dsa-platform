const Guild = require('../models/guild.model');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const crypto = require('crypto');

class GuildService {
    async createGuild(ownerId, { name, description, banner }) {
        // Verify user not already in a guild
        const alreadyInGuild = await Guild.findOne({ members: ownerId });
        if (alreadyInGuild) {
            throw new ApiError(400, 'You must leave your current guild before creating a new alliance');
        }

        // Generate invite code
        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        const guild = await Guild.create({
            name,
            description,
            banner: banner || 'banner-default',
            inviteCode,
            owner: ownerId,
            members: [ownerId]
        });

        return guild;
    }

    async joinGuild(userId, inviteCode) {
        const alreadyInGuild = await Guild.findOne({ members: userId });
        if (alreadyInGuild) {
            throw new ApiError(400, 'You are already bound to another guild alliance');
        }

        const guild = await Guild.findOne({ inviteCode: inviteCode.toUpperCase() });
        if (!guild) {
            throw new ApiError(404, 'Alliance invite code not matched inside scrolls');
        }

        guild.members.push(userId);
        await guild.save();
        return guild;
    }

    async leaveGuild(userId) {
        const guild = await Guild.findOne({ members: userId });
        if (!guild) throw new ApiError(404, 'You are not active inside any guild scrolls');

        if (String(guild.owner) === String(userId)) {
            throw new ApiError(400, 'Alliance masters cannot desert. Transfer ownership coordinates first');
        }

        guild.members = guild.members.filter(mId => String(mId) !== String(userId));
        await guild.save();
        return guild;
    }

    async transferOwnership(ownerId, newOwnerId) {
        const guild = await Guild.findOne({ owner: ownerId });
        if (!guild) throw new ApiError(403, 'Action restricted to alliance masters');

        const isNewOwnerMember = guild.members.some(mId => String(mId) === String(newOwnerId));
        if (!isNewOwnerMember) {
            throw new ApiError(400, 'Target owner must be a member of the guild');
        }

        guild.owner = newOwnerId;
        await guild.save();
        return guild;
    }

    async removeMember(ownerId, memberId) {
        const guild = await Guild.findOne({ owner: ownerId });
        if (!guild) throw new ApiError(403, 'Action restricted to alliance masters');

        if (String(ownerId) === String(memberId)) {
            throw new ApiError(400, 'Masters cannot exile themselves');
        }

        guild.members = guild.members.filter(mId => String(mId) !== String(memberId));
        await guild.save();
        return guild;
    }

    async getGuildDetails(userId) {
        return await Guild.findOne({ members: userId })
            .populate('owner', 'username xp level avatar')
            .populate('members', 'username xp level avatar');
    }

    async getGuildLeaderboard() {
        return await Guild.find()
            .populate('owner', 'username')
            .sort({ level: -1, xp: -1 })
            .limit(20);
    }
}

module.exports = new GuildService();
