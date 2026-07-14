const mongoose = require('mongoose');

const bossSchema = new mongoose.Schema({
    realmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'World',
        required: [true, 'Realm reference is required'],
        index: true,
        unique: true
    },
    bossName: {
        type: String,
        required: [true, 'Boss name is required'],
        trim: true
    },
    difficulty: {
        type: String,
        required: [true, 'Boss difficulty level is required'],
        default: 'boss'
    },
    reward: {
        xp: { type: Number, default: 500 },
        coins: { type: Number, default: 150 },
        relic: { type: String, default: 'Void Core' },
        title: { type: String, default: 'Boss Slayer' }
    },
    requiredLevel: {
        type: Number,
        default: 1
    },
    requiredTrials: {
        type: Number,
        default: 3
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: [true, 'Problem reference is required']
    }
}, {
    timestamps: true
});

const Boss = mongoose.model('Boss', bossSchema);

module.exports = Boss;
