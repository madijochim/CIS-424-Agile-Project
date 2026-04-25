const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/authMiddleware");
const Employee = require("../models/Employee");
const { assembleEmployeePayroll } = require("../services/payrollAssemblyService");

const router = express.Router();

function numOrUndefined(v) {
  if (v === "" || v === undefined || v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// Get payroll runs with calculated gross pay and tax deductions
router.get("/runs", requireAuth, async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true }).lean();
    const payroll = employees.map((employee) => assembleEmployeePayroll(employee));

    return res.json({
      message: "Payroll data retrieved successfully.",
      employees: payroll,
    });
  } catch (error) {
    console.error("Payroll error:", error);
    return res.status(500).json({
      error: "Server error retrieving payroll data.",
    });
  }
});

/**
 * Preview payroll + taxes using current form values (does not persist).
 * Body: { lines: [{ employeeId, totalHours?, salary?, payFrequency?, bonusPay? }] }
 */
router.post("/preview", requireAuth, requireRoles("Admin", "Manager"), async (req, res) => {
  try {
    const { lines } = req.body || {};
    if (!Array.isArray(lines)) {
      return res.status(400).json({ error: "Request body must include a lines array." });
    }

    const results = [];

    for (const line of lines) {
      if (!line?.employeeId) continue;

      const emp = await Employee.findById(line.employeeId).lean();
      if (!emp || !emp.isActive) continue;

      const merged = { ...emp };

      const th = numOrUndefined(line.totalHours);
      if (th !== undefined) merged.hoursWorked = th;

      const sal = numOrUndefined(line.salary);
      if (sal !== undefined) merged.salary = sal;

      if (line.payFrequency !== undefined && line.payFrequency !== "") {
        merged.payFrequency = line.payFrequency;
      }

      const bon = numOrUndefined(line.bonusPay);
      if (bon !== undefined) merged.bonusPay = bon;

      results.push(assembleEmployeePayroll(merged));
    }

    return res.json({
      message: "Payroll preview generated.",
      employees: results,
    });
  } catch (error) {
    console.error("Payroll preview error:", error);
    return res.status(500).json({ error: "Server error generating payroll preview." });
  }
});

module.exports = router;
