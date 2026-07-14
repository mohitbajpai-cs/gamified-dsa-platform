const mongoose = require('mongoose');

const achievementTemplateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Achievement template title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Achievement template description is required']
    },
    icon: {
        type: String,
        required: [true, 'Achievement template icon is required']
    },
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        required: [true, 'Achievement template rarity is required']
    },
    xpReward: {
        type: Number,
        required: [true, 'Achievement template XP reward is required']
    },
    coinsReward: {
        type: Number,
        required: [true, 'Achievement template Coins reward is required']
    },
    conditionType: {
        type: String,
        required: [true, 'Achievement template condition type is required']
    },
    conditionValue: {
        type: Number,
        required: [true, 'Achievement template condition value is required']
    }
}, {
    timestamps: true
});

const AchievementTemplate = mongoose.model('AchievementTemplate', achievementTemplateSchema);

module.exports = AchievementTemplate;
