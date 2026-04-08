const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  registerFieldRules,
  loginFieldRules,
  handleValidation,
} = require("../middleware/validators");

const router = express.Router();

router.post("/register", registerFieldRules, handleValidation, registerUser);
router.post("/login", loginFieldRules, handleValidation, loginUser);
router.post("/logout", logoutUser);
router.get("/me", requireAuth, getMe);

module.exports = router;
