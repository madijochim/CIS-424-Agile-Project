const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/authMiddleware");
const Employee = require("../models/Employee");
const { deactivateEmployee } = require("../controllers/employeeController");

const router = express.Router();

router.get("/", requireAuth, requireRoles("Admin", "Manager"), async (req, res) => {
  try {
    const { search = "", department = "", status = "active" } = req.query;

    const query = {};

    // Filter by employee status
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by employee name search
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(employees);
  } catch (error) {
    console.error("Error listing employees:", error);
    return res.status(500).json({ error: "Server error listing employees." });
  }
});

router.post("/", requireAuth, requireRoles("Admin", "Manager"), async (req, res) => {
  try {
    const { name, department, rate, payType } = req.body;
    const ssn = String(req.body.ssn);
    
    if (!name || !ssn || !department || !rate || !payType) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingEmployee = await Employee.findOne({ ssn });

    if (existingEmployee) {
      return res.status(400).json({ message: "SSN already exists." });
    }

    const employee = await Employee.create({
      name,
      ssn,
      department,
      rate,
      payType,
    });

    return res.status(201).json(employee);
  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({ message: "Server error creating employee." });
  }
});

// Deactivate employee
router.patch(
  "/:id/deactivate",
  requireAuth,
  requireRoles("Admin", "Manager"),
  deactivateEmployee
);


module.exports = router;