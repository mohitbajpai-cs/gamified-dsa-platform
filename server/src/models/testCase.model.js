const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: [true, 'Problem reference is required'],
        index: true
    },
    input: {
        type: String,
        required: [true, 'TestCase input is required']
    },
    expectedOutput: {
        type: String,
        required: [true, 'TestCase expected output is required']
    },
    hidden: {
        type: Boolean,
        default: true,
        index: true
    },
    explanation: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const TestCase = mongoose.model('TestCase', testCaseSchema);

module.exports = TestCase;
