const ApiError = require('../utils/apiError');

/**
 * Centralized error handler middleware.
 * Intercepts all errors, formats them according to ApiError schema,
 * and sends standard JSON response.
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Convert generic Error to custom ApiError if not already one
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, error.errors || [], err.stack);
    }

    const response = {
        success: false,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    };

    res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
