const mongoose = require('mongoose');

const worldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'World name is required'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'World slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'World description is required']
    },
    order: {
        type: Number,
        default: 0
    },
    difficulty: {
        type: String,
        required: [true, 'World difficulty level is required'],
        enum: {
            values: ['beginner', 'intermediate', 'advanced'],
            message: 'Difficulty must be: beginner, intermediate, or advanced'
        },
        index: true
    },
    unlockLevel: {
        type: Number,
        default: 1
    },
    thumbnail: {
        type: String,
        default: ""
    },
    totalProblems: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const World = mongoose.model('World', worldSchema);

module.exports = World;
