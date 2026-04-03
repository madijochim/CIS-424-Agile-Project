const express = require("express");
const { registerUser } = require("../controllers/authController");

const router = express.Router();

// US-001 register endpoint
router.post("/register", registerUser);

module.exports = router;