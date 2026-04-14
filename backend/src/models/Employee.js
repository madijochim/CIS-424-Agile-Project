const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ssn: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    payType: {
      type: String,
      required: true,
      enum: ["hourly", "salary"],
    },

    // Updated: no longer required (so salary employees work)
    rate: {
      type: Number,
      min: 0,
      default: null,
    },

    // ✅ NEW FIELDS FOR PAYROLL
    hoursWorked: {
      type: Number,
      min: 0,
      default: 0,
    },

    salary: {
      type: Number,
      min: 0,
      default: null,
    },

    payFrequency: {
      type: String,
      enum: ["weekly", "biweekly"],
      default: null,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    jobTitle: {
      type: String,
      trim: true,
      default: null,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || /^\S+@\S+\.\S+$/.test(v);
        },
        message: "Invalid email address"
      }
    },

    phone: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || /^\+?[0-9\-() ]+$/.test(v);
        },
        message: "Invalid phone number"
      }
    },

    hireDate: {
      type: Date,
      default: Date.now
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    seedMeta: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);