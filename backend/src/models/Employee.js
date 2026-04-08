const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ssn: { type: String, required: true, trim: true },
    payType: {
      type: String,
      required: true,
      enum: ["hourly", "salary"],
    },
    rate: { type: Number, required: true, min: 0 },
    department: { type: String, required: true, trim: true },
    seedMeta: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
