const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const jwt = require('jsonwebtoken');

class AuthService {
    /**
     * Registers a new user.
     * Checks for uniqueness of username and email.
     *
     * @param {Object} userData - Registration inputs.
     * @returns {Promise<Object>} Sanitized user object without password.
     */
    async registerUser({ username, email, password }) {
        if (!username || !email || !password) {
            throw new ApiError(400, 'Username, email, and password are required');
        }

        const trimmedEmail = email.trim().toLowerCase();
        const trimmedUsername = username.trim().toLowerCase();

        // Perform basic input validation
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(trimmedEmail)) {
            throw new ApiError(400, 'Please enter a valid email address');
        }

        if (username.length < 3) {
            throw new ApiError(400, 'Username must be at least 3 characters long');
        }

        if (password.length < 6) {
            throw new ApiError(400, 'Password must be at least 6 characters long');
        }
const mongoose = require("mongoose");

console.log("Ready State:", mongoose.connection.readyState);
console.log("Database:", mongoose.connection.db?.databaseName);
        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [{ email: trimmedEmail }, { username: trimmedUsername }]
        });

        if (existingUser) {
            if (existingUser.email === trimmedEmail) {
                throw new ApiError(409, 'Email is already registered');
            }
            if (existingUser.username === trimmedUsername) {
                throw new ApiError(409, 'Username is already taken');
            }
        }

        // Create the user
        const newUser = await User.create({
            username: username.trim(),
            email: trimmedEmail,
            password
        });

        // Convert to plain JS object and strip sensitive fields
        const userObj = newUser.toObject();
        delete userObj.password;

        return userObj;
    }

    /**
     * Authenticates user, signs a JWT token.
     *
     * @param {Object} credentials - Login inputs.
     * @returns {Promise<Object>} Object containing authenticated user data and signed JWT.
     */
    async loginUser({ email, password }) {
        if (!email || !password) {
            throw new ApiError(400, 'Email and password are required');
        }

        const trimmedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: trimmedEmail });
        if (!user) {
            throw new ApiError(401, 'Invalid email or password');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new ApiError(401, 'Invalid email or password');
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_super_secret_key',
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
        );

        const userObj = user.toObject();
        delete userObj.password;

        return { user: userObj, token };
    }
}

module.exports = new AuthService();
