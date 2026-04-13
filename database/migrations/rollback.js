/**
 * US-031: Rollback removes seeded documents created by migrate.js (does not drop the database).
 */
const path = require("path");
module.paths.unshift(path.join(__dirname, "../../backend/node_modules"));
require("dotenv").config({ path: path.join(__dirname, "../../backend/.env") });

require(path.join(__dirname, "../../backend/src/config/mongoDns")).applyMongoDnsFromEnv();

const mongoose = require("mongoose");

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is required (set in backend/.env).");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const result = await mongoose.connection.db.collection("employees").deleteMany({ seedMeta: true });
  console.log(`Rollback removed ${result.deletedCount} seeded employee record(s).`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Rollback failed:", err);
  try {
    await mongoose.disconnect();
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});
