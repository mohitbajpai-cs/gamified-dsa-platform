const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Contest title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Contest description is required']
    },
    type: {
        type: String,
        enum: ['Daily Challenge', 'Weekly Contest', 'Monthly Championship', 'Virtual Contest', 'Practice Contest'],
        required: [true, 'Contest type is required']
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required']
    },
    duration: {
        type: Number, // In minutes
        required: [true, 'Duration in minutes is required']
    },
    problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
        default: 'Mixed'
    },
    maxParticipants: {
        type: Number,
        default: 1000
    },
    rewards: {
        xp: { type: Number, default: 500 },
        coins: { type: Number, default: 100 },
        badge: { type: String, default: '' },
        trophy: { type: String, default: '' },
        title: { type: String, default: '' }
    },
    status: {
        type: String,
        enum: ['upcoming', 'live', 'completed'],
        default: 'upcoming'
    },
    bannerImage: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Contest = mongoose.model('Contest', contestSchema);
module.exports = Contest;
