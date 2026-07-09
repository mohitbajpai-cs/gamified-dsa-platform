const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'Achievement title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Achievement description is required']
    },
    badge: {
        type: String,
        required: [true, 'Achievement badge is required']
    },
    rarity: {
        type: String,
        required: [true, 'Achievement rarity is required'],
        enum: {
            values: ['common', 'rare', 'epic', 'legendary'],
            message: 'Rarity must be: common, rare, epic, or legendary'
        },
        index: true
    },
    xpReward: {
        type: Number,
        default: 0
    },
    coinReward: {
        type: Number,
        default: 0
    },
    unlockedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Enforce unique achievement titles per user
achievementSchema.index({ user: 1, title: 1 }, { unique: true });

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
