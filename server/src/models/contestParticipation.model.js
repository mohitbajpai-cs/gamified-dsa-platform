const mongoose = require('mongoose');

const contestParticipationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true,
        index: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    solvedCount: {
        type: Number,
        default: 0
    },
    penalty: {
        type: Number, // Sum of elapsed times (min) + 20 mins per wrong attempt for solved problems
        default: 0
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['registered', 'active', 'completed'],
        default: 'registered'
    },
    ratingChange: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Enforce unique registration per user per contest
contestParticipationSchema.index({ user: 1, contest: 1 }, { unique: true });

const ContestParticipation = mongoose.model('ContestParticipation', contestParticipationSchema);
module.exports = ContestParticipation;
