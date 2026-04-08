/**
 * US-031: MongoDB schema/index sync and seed (relational migrations are N/A; Mongoose is the persistence layer — US-034).
 * Run from repo root: cd backend && npm run migrate
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../backend/.env") });

const mongoose = require("mongoose");
const User = require("../../backend/src/models/User");
const Employee = require("../../backend/src/models/Employee");
const AuditLog = require("../../backend/src/models/AuditLog");

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is required (set in backend/.env).");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected for migration.");

  await User.syncIndexes();
  await Employee.syncIndexes();
  await AuditLog.syncIndexes();

  const existingSeed = await Employee.findOne({ seedMeta: true });
  if (!existingSeed) {
    await Employee.create({
      name: "Seed Employee",
      ssn: "000-00-0000",
      payType: "hourly",
      rate: 25,
      department: "Operations",
      seedMeta: true,
    });
    console.log("Seed employee created.");
  } else {
    console.log("Seed employee already present; skipping insert.");
  }

  console.log("Migration completed successfully.");
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Migration failed:", err);
  try {
    await mongoose.disconnect();
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});
