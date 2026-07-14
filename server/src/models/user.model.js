const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: ['student', 'moderator', 'admin'],
        default: 'student'
    },
    avatar: {
        type: String,
        default: ""
    },
    xp: {
        type: Number,
        default: 0
    },
    coins: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    achievements: {
        type: [String],
        default: []
    },
    completedProblems: {
        type: [String],
        default: []
    },
    totalSolved: {
        type: Number,
        default: 0
    },
    completedTopics: {
        type: [String],
        default: []
    },
    completedWorlds: {
        type: [String],
        default: []
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastSolvedDate: {
        type: Date,
        default: null
    },
    currentTitle: {
        type: String,
        default: ""
    },
    rank: {
        type: String,
        default: "Novice"
    },
    claimedRewards: {
        type: [String],
        default: []
    },
    unlockedAchievements: {
        type: [String],
        default: []
    },
    dailyLogin: {
        streak: { type: Number, default: 0 },
        lastLoginDate: { type: Date, default: null },
        claimedToday: { type: Boolean, default: false }
    },
    rewardHistory: [
        {
            rewardType: { type: String },
            xp: { type: Number, default: 0 },
            coins: { type: Number, default: 0 },
            rewardedAt: { type: Date, default: Date.now }
        }
    ],
    bossesDefeated: {
        type: [String],
        default: []
    },
    realmCompletion: [
        {
            realmId: { type: mongoose.Schema.Types.ObjectId, ref: 'World' },
            completionPct: { type: Number, default: 0 },
            conquered: { type: Boolean, default: false }
        }
    ],
    bossTrophies: {
        type: [String],
        default: []
    },
    contestRating: { type: Number, default: 1200 },
    highestRating: { type: Number, default: 1200 },
    contestsPlayed: { type: Number, default: 0 },
    contestsWon: { type: Number, default: 0 },
    contestBadges: { type: [String], default: [] },
    bestRank: { type: Number, default: null }
}, {
    timestamps: true
});

// Pre-save hook to hash password before writing to the database
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, 10);
});

// Instance method to check password verification
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
