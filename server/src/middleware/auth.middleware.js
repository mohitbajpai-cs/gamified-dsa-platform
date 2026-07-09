const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to verify JWT, fetch authenticated user, and inject into request context.
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check cookie storage first, fallback to Authorization header
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ApiError(401, 'Not authorized, please login to gain access');
    }

    try {
        // Decode and verify signed token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key');

        // Fetch user from DB, omitting password field
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            throw new ApiError(401, 'User associated with this session no longer exists');
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, 'Not authorized, session token is invalid or expired');
    }
});

/**
 * Middleware to restrict access to specific roles.
 *
 * @param {...String} roles - Permitted roles list.
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new ApiError(403, 'Access denied, you do not have permission to perform this action');
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo
};
