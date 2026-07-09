const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        index: true
    },
    world: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'World',
        required: [true, 'World reference is required'],
        index: true
    },
    completedProblems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    totalXP: {
        type: Number,
        default: 0
    },
    totalCoins: {
        type: Number,
        default: 0
    },
    currentLevel: {
        type: Number,
        default: 1
    },
    unlockedWorlds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'World'
    }],
    currentStreak: {
        type: Number,
        default: 0
    },
    isBossUnlocked: {
        type: Boolean,
        default: false
    },
    isCompleted: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

// Enforce unique progress per user-world pair
progressSchema.index({ user: 1, world: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
