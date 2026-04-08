const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/authMiddleware");
const Employee = require("../models/Employee");

const router = express.Router();

router.get("/", requireAuth, requireRoles("Admin", "Manager"), async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 }).lean();
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ error: "Server error listing employees." });
  }
});

module.exports = router;
