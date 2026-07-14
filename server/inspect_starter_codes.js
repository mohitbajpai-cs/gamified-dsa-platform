const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Problem = require('./src/models/problem.model');
require('dotenv').config();

const run = async () => {
    try {
        await connectDB();
        
        const problems = await Problem.find({});
        console.log(`Checking ${problems.length} problems for starterCode...`);
        for (const p of problems.slice(0, 10)) {
            console.log(`\nProblem: "${p.title}"`);
            console.log('starterCode:', JSON.stringify(p.starterCode));
            console.log('starterCode Type:', typeof p.starterCode);
        }

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
};

run();
