/**
 * A wrapper function to eliminate the need for try-catch blocks in async Express route handlers.
 * Failsafe catches errors and forwards them to the next error-handling middleware.
 *
 * @param {Function} fn - Asynchronous express route handler.
 * @returns {Function} Express middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
