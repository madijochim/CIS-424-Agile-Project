const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/authMiddleware");
const Employee = require("../models/Employee");
const { deactivateEmployee } = require("../controllers/employeeController");
const AuditLog = require("../models/AuditLog");

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

//get employee data for editing
router.get("/:id", requireAuth, requireRoles("Admin", "Manager"), async (req, res) => {
    try {
      const emp = await Employee.findById(req.params.id);

      if (!emp) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(emp);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Server error" });
    }
});

//update employee data after editing
router.put("/:id", requireAuth, requireRoles("Admin", "Manager"), async (req, res) => {
  try {
    // 1. Get original employee (BEFORE update)
    const existing = await Employee.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 2. Perform update
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        department: req.body.department,
        rate: req.body.rate,
        payType: req.body.payType,
        jobTitle: req.body.jobTitle || null,
        email: req.body.email || null,
        phone: req.body.phone || null,
        hireDate: req.body.hireDate || null,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
        return res.status(404).json({ message: "Employee not found" });
    }
    
    // 3. Build changes object (diff)
    const changes = {};

    const fieldsToTrack = [
      "name",
      "department",
      "rate",
      "payType",
      "jobTitle",
      "email",
      "phone",
      "hireDate",
    ];

    fieldsToTrack.forEach((field) => {
      const oldValue = existing[field];
      const newValue = updated[field];

    const normalize = (val) => {
      if (val === null || val === undefined) return "";

      // handle Date objects AND date strings consistently
      const date = new Date(val);
      if (!isNaN(date.getTime()) && (val instanceof Date || typeof val === "string")) {
        return date.toISOString();
      }

      return String(val);
    };

      if (normalize(oldValue) !== normalize(newValue)) {
        changes[field] = {
          before: oldValue,
          after: newValue,
        };
      }
    });

    // 4. Save audit log ONLY if something changed
    if (Object.keys(changes).length > 0) {
      await AuditLog.create({
        actorId: req.user.id, // assumes auth middleware sets req.user
        targetEmployeeId: existing._id,
        action: "UPDATE_EMPLOYEE",
        changes,
      });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Error editing employee data:", error);
    return res.status(500).json({ message: "Server error editing employee data." });
  }
});

module.exports = router;