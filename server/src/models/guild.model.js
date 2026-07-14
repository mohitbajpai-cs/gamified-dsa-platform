const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Guild name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Guild description is required']
    },
    banner: {
        type: String,
        default: 'banner-default'
    },
    inviteCode: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Guild = mongoose.model('Guild', guildSchema);
module.exports = Guild;
