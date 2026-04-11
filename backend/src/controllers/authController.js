const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendConfirmationEmail, sendPasswordResetEmail } = require("../utils/email");
const { generateResetToken } = require("../utils/token");
const { getJwtSecret } = require("../middleware/authMiddleware");

const COOKIE_NAME = "token";
const SESSION_MS = 30 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_MS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: "That email address is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    const token = generateResetToken();

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${token}`;
    await sendPasswordResetEmail(user.email, resetLink);

    return res.status(200).json({
      message: "Password reset link sent successfully.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({
      error: "Server error while sending password reset link.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({
      error: "Server error while resetting password.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const role = user.role || "Viewer";

    const token = jwt.sign(
      { sub: user._id.toString(), role },
      getJwtSecret(),
      { expiresIn: "30m" }
    );

    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error while logging in.",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const payload = user.toObject();
    payload.role = payload.role || "Viewer";
    return res.json({ user: payload });
  } catch (error) {
    return res.status(500).json({ error: "Server error." });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res.status(200).json({ message: "Logged out." });
};

module.exports = {
  registerUser,
  forgotPassword,
  resetPassword,
  loginUser,
  getMe,
  logoutUser,
};
