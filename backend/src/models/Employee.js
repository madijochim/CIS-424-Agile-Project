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
    rate: {
      type: Number,
      required: true,
      min: 0,
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

    // Keep track of whether the employee is active or inactive
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