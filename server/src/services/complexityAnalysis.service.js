/**
 * Complexity Analysis Service Delegator
 * Redirects to the modular architecture under src/services/complexity/analyzer.service
 */
const analyzerService = require('./complexity/analyzer.service');
module.exports = analyzerService;
