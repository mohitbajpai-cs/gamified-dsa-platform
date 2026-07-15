const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seed.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// One-time bootstrap route — secured by shared secret, no auth required
// REMOVE THIS AFTER SEEDING
router.post('/bootstrap', (req, res, next) => {
    if (req.headers['x-seed-secret'] !== 'valthor-bootstrap-2026') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
}, seedController.runSeed);

// Protected admin seeder route
router.post('/', protect, restrictTo('admin'), seedController.runSeed);

module.exports = router;
