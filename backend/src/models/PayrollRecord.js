const mongoose = require("mongoose");

const payrollRecordSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    taxYear: {
      type: Number,
      required: true,
    },
    payDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    grossPay: {
      type: Number,
      required: true,
      min: 0,
    },

    federalWithholding: {
      type: Number,
      min: 0,
      default: 0,
    },

    socialSecurityWithholding: {
      type: Number,
      min: 0,
      default: 0,
    },
    medicareWithholding: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalDeductions: {
      type: Number,
      min: 0,
      default: 0,
    },
    netPay: {
      type: Number,
      min: 0,
      default: 0,
    },

    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PayrollRecord", payrollRecordSchema);

