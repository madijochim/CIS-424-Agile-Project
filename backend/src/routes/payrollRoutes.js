const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const Employee = require("../models/Employee");
const {
  calculateHourlyPay,
  calculateSalaryPay,
} = require("../services/payrollService");

const router = express.Router();

// Get payroll runs with calculated gross pay
router.get("/runs", requireAuth, async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true }).lean();

    const payroll = employees.map((employee) => {
      try {
        if (employee.payType === "hourly") {
          const result = calculateHourlyPay(employee.hoursWorked, employee.rate, employee.bonusPay);

          return {
            ...employee,
            payroll: {
              payType: "hourly",
              hoursWorked: result.hoursWorked,
              overtimeHours: result.overtimeHours,
              hourlyRate: result.hourlyRate,
              grossPay: result.grossPay,
              normalPay: result.normalPay,
              overtimePay: result.overtimePay,
              bonusPay: result.bonusPay,
            },
          };
        }

        if (employee.payType === "salary") {
          const result = calculateSalaryPay(employee.salary, employee.payFrequency, employee.bonusPay);

          return {
            ...employee,
            payroll: {
              payType: "salary",
              annualSalary: result.annualSalary,
              payFrequency: result.payFrequency,
              periods: result.periods,
              grossPay: result.grossPay,
              bonusPay: result.bonusPay,
            },
          };
        }

        return {
          ...employee,
          payroll: {
            error: "Unknown pay type.",
          },
        };
      } catch (err) {
        return {
          ...employee,
          payroll: {
            error: err.message,
          },
        };
      }
    });

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

module.exports = router;