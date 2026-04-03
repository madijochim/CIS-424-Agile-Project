const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { isValidEmail } = require("../utils/validators");
const { sendConfirmationEmail } = require("../utils/email");

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required.",
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
      });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        error: "That email address is already registered.",
      });
    }

    // Hash password with bcrypt before saving to DB
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Trigger confirmation email stub
    await sendConfirmationEmail(newUser.email);

    return res.status(201).json({
      message: "Registration successful. A confirmation email has been triggered.",
      userId: newUser._id,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error while registering user.",
    });
  }
};

module.exports = {
  registerUser,
};