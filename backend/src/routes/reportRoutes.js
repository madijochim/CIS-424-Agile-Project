const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", requireAuth, (req, res) => {
  return res.json({ message: "Reports API stub.", data: [] });
});

module.exports = router;
