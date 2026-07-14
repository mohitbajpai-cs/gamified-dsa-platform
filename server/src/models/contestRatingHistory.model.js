const mongoose = require('mongoose');

const contestRatingHistorySchema = new mongoose.Schema({
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
    oldRating: {
        type: Number,
        required: true
    },
    newRating: {
        type: Number,
        required: true
    },
    rank: {
        type: Number,
        required: true
    },
    ratingChange: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const ContestRatingHistory = mongoose.model('ContestRatingHistory', contestRatingHistorySchema);
module.exports = ContestRatingHistory;
