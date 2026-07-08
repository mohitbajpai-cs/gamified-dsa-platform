const express = require('express');
const router = express.Router();

// Define the GET endpoint for the root URL
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to our Gamified DSA Platform API"
    });
});

module.exports = router;