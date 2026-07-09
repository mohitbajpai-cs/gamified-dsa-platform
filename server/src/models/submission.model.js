const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        index: true
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: [true, 'Problem reference is required'],
        index: true
    },
    code: {
        type: String,
        required: [true, 'Submission code is required']
    },
    language: {
        type: String,
        required: [true, 'Programming language is required'],
        default: 'javascript'
    },
    verdict: {
        type: String,
        required: [true, 'Submission verdict is required'],
        enum: {
            values: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error'],
            message: 'Verdict must be: accepted, wrong_answer, time_limit_exceeded, runtime_error, or compilation_error'
        },
        index: true
    },
    score: {
        type: Number,
        default: 0
    },
    executionTime: {
        type: Number,
        default: 0
    },
    memoryUsed: {
        type: Number,
        default: 0
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    totalTestCases: {
        type: Number,
        default: 0
    },
    errorMessage: {
        type: String,
        default: ""
    },
    submittedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
