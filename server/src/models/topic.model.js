const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    world: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'World',
        required: [true, 'Parent world reference is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Topic name is required'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Topic slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: 0
    },
    totalProblems: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
