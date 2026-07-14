const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        index: true
    },
    type: {
        type: String,
        enum: ['daily', 'weekly'],
        required: [true, 'Quest type is required']
    },
    title: {
        type: String,
        required: [true, 'Quest title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Quest description is required']
    },
    targetType: {
        type: String,
        enum: ['solve_easy', 'solve_medium', 'earn_xp', 'complete_topic', 'solve_any', 'complete_world'],
        required: [true, 'Target type is required']
    },
    targetValue: {
        type: Number,
        required: [true, 'Target value is required']
    },
    currentValue: {
        type: Number,
        default: 0
    },
    xpReward: {
        type: Number,
        required: [true, 'XP reward is required']
    },
    coinReward: {
        type: Number,
        required: [true, 'Coin reward is required']
    },
    completed: {
        type: Boolean,
        default: false
    },
    claimed: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiration date is required'],
        index: true
    }
}, {
    timestamps: true
});

const Quest = mongoose.model('Quest', questSchema);

module.exports = Quest;
