const { applyMongoDnsFromEnv } = require("./mongoDns");
applyMongoDnsFromEnv();

const mongoose = require("mongoose");

// Connect to the MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;