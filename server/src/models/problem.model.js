const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
    input: {
        type: String,
        required: [true, 'Example input is required']
    },
    output: {
        type: String,
        required: [true, 'Example output is required']
    },
    explanation: {
        type: String,
        default: ""
    }
}, { _id: false });

const problemSchema = new mongoose.Schema({
    world: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'World',
        required: [true, 'World reference is required'],
        index: true
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: [true, 'Topic reference is required'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'Problem title is required'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Problem slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Problem description is required']
    },
    difficulty: {
        type: String,
        required: [true, 'Problem difficulty level is required'],
        enum: {
            values: ['easy', 'medium', 'hard', 'boss'],
            message: 'Difficulty must be: easy, medium, hard, or boss'
        },
        index: true
    },
    starterCode: {
        type: String,
        default: ""
    },
    solutionTemplate: {
        type: String,
        default: ""
    },
    examples: {
        type: [exampleSchema],
        default: []
    },
    constraints: {
        type: [String],
        default: []
    },
    hints: {
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        default: [],
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
    bossLevel: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
