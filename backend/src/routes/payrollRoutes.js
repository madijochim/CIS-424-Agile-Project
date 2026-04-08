const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/runs", requireAuth, (req, res) => {
  return res.json([]);
});

module.exports = router;
