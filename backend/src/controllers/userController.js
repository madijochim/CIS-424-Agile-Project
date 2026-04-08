const mongoose = require("mongoose");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user id." });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ error: "User not found." });
    }

    const previousRole = target.role;
    if (previousRole === role) {
      return res.json({
        message: "No change.",
        user: target.toJSON(),
      });
    }

    target.role = role;
    await target.save();

    await AuditLog.create({
      actorId: req.user.id,
      targetUserId: target._id,
      action: "role_change",
      previousRole,
      newRole: role,
    });

    const fresh = await User.findById(id).select("-password");
    return res.json({
      message: "Role updated.",
      user: fresh,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error while updating role." });
  }
};

module.exports = {
  updateUserRole,
};
