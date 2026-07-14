const mongoose = require('mongoose');

const contestSubmissionSchema = new mongoose.Schema({
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
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    verdict: {
        type: String,
        enum: ['accepted', 'wrong_answer', 'runtime_error', 'compile_error'],
        required: true
    },
    penaltyTime: {
        type: Number, // Minutes elapsed since contest start
        default: 0
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    totalTestCases: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const ContestSubmission = mongoose.model('ContestSubmission', contestSubmissionSchema);
module.exports = ContestSubmission;
