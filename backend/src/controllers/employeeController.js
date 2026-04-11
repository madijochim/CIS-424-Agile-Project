const Employee = require("../models/Employee");

// Deactivate employee without deleting the record
const deactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Find employee by ID
    const employee = await Employee.findById(id);

    // If employee does not exist, return 404
    if (!employee) {
      return res.status(404).json({
        error: "Employee not found.",
      });
    }

    // Mark employee as inactive
    employee.isActive = false;

    // Save updated employee record
    await employee.save();

    // Return success response
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

module.exports = {
  deactivateEmployee,
};