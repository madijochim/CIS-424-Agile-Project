const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    previousRole: { type: String },
    newRole: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
