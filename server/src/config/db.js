const mongoose = require('mongoose');

/**
 * Establish connection to the MongoDB Database.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/abyss_protocol');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        console.warn('Server is running, but database connection could not be established.');
    }
};

module.exports = connectDB;
