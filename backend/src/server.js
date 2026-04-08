const dotenv = require("dotenv");

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required. Set it in backend/.env (see .env.example).");
  process.exit(1);
}

const connectDB = require("./config/db");
const app = require("./app");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
