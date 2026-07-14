const mongoose = require('mongoose');

const questTemplateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quest template title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Quest template description is required']
    },
    type: {
        type: String,
        enum: ['daily', 'weekly'],
        required: [true, 'Quest template type is required']
    },
    targetType: {
        type: String,
        enum: ['solve_easy', 'solve_medium', 'earn_xp', 'complete_topic', 'solve_any', 'complete_world'],
        required: [true, 'Quest template target type is required']
    },
    targetValue: {
        type: Number,
        required: [true, 'Quest template target value is required']
    },
    xpReward: {
        type: Number,
        required: [true, 'Quest template XP reward is required']
    },
    coinsReward: {
        type: Number,
        required: [true, 'Quest template Coins reward is required']
    }
}, {
    timestamps: true
});

const QuestTemplate = mongoose.model('QuestTemplate', questTemplateSchema);

module.exports = QuestTemplate;
