// Register global error handlers immediately to catch any early startup failures
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION DURING STARTUP:", err.stack || err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason?.stack || reason);
  process.exit(1);
});

console.log("Starting server initialization...");

// Load environment variables
require("dotenv").config();
console.log("dotenv configuration loaded.");

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`FATAL STARTUP ERROR: Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}
console.log("Environment variables verified successfully.");

console.log("Importing application modules...");
const app = require("./src/app");
console.log("Express application initialized.");

const connectDB = require("./src/config/db");
console.log("Database connection handler imported.");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("Connecting to MongoDB Database...");
    await connectDB();

    console.log(`Starting server on port ${PORT}...`);
    app.listen(PORT, () => {
      console.log(`Server successfully running on port ${PORT}`);
    });
  } catch (error) {
    console.error("FATAL ERROR DURING SERVER STARTUP:", error.stack || error);
    process.exit(1);
  }
};

startServer();