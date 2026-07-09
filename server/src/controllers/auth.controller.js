const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
    /**
     * Handles user registration.
     */
   register = asyncHandler(async (req, res) => {
    console.log("Request Body:", req.body);

    const { username, email, password } = req.body;

    const newUser = await authService.registerUser({
        username,
        email,
        password
    });

        res.status(201).json(
            new ApiResponse(201, newUser, 'User registered successfully')
        );
    });

    /**
     * Handles user authentication and sets an HTTP-only cookie containing the JWT.
     */
    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const { user, token } = await authService.loginUser({ email, password });

        // Set JWT inside an HTTP-only cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching token expiry
        };

        res.cookie('token', token, cookieOptions);

        res.status(200).json(
            new ApiResponse(200, user, 'Logged in successfully')
        );
    });

    /**
     * Clears authentication cookie to log the user out.
     */
    logout = asyncHandler(async (req, res) => {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json(
            new ApiResponse(200, null, 'Logged out successfully')
        );
    });

    /**
     * Retrieves the profile of the currently logged-in user.
     */
    getProfile = asyncHandler(async (req, res) => {
        // req.user was injected by protect middleware
        res.status(200).json(
            new ApiResponse(200, req.user, 'Profile retrieved successfully')
        );
    });
}

module.exports = new AuthController();
