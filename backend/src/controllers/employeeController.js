const Employee = require("../models/Employee");

// Deactivate employee without deleting the record
const deactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found.",
      });
    }

    employee.isActive = false;

    await employee.save();

    return res.status(200).json({
      message: "Employee deactivated successfully.",
      employee,
    });
  } catch (error) {
    console.error("deactivateEmployee error:", error);
    return res.status(500).json({
      error: "Server error while deactivating employee.",
    });
  }
};

// Update employee information
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found.",
      });
    }

    employee.name = req.body.name ?? employee.name;
    employee.department = req.body.department ?? employee.department;
    employee.payType = req.body.payType ?? employee.payType;

    if (req.body.payType === "hourly") {
      employee.rate = req.body.rate ?? employee.rate;
      employee.salary = null;
      employee.payFrequency = null;
    }

    if (req.body.payType === "salary") {
      employee.salary = req.body.salary ?? employee.salary;
      employee.payFrequency = req.body.payFrequency ?? employee.payFrequency;
      employee.rate = null;
    }

    employee.jobTitle = req.body.jobTitle ?? employee.jobTitle;
    employee.email = req.body.email ?? employee.email;
    employee.phone = req.body.phone ?? employee.phone;
    employee.hireDate = req.body.hireDate ?? employee.hireDate;

    await employee.save();

    return res.status(200).json({
      message: "Employee updated successfully.",
      employee,
    });
  } catch (error) {
    console.error("updateEmployee error:", error);
    return res.status(500).json({
      error: "Server error while updating employee.",
    });
  }
};

module.exports = {
  deactivateEmployee,
  updateEmployee,
};