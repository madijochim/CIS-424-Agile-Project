const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const Employee = require("../models/Employee");

const router = express.Router();

// Get payroll runs (for now just returns active employees)
router.get("/runs", requireAuth, async (req, res) => {
  try {
    // Only include active employees
    const employees = await Employee.find({ isActive: true }).lean();

    return res.json({
      message: "Payroll data retrieved successfully.",
      employees,
    });
  } catch (error) {
    console.error("Payroll error:", error);
    return res.status(500).json({
      error: "Server error retrieving payroll data.",
    });
  }
});

module.exports = router;