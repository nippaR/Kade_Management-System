const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { User, ActivityLog } = require("../models/User");
const crypto = require("crypto");


const router = express.Router();

// Get All Users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Sign-Up Route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Log Activity
    await new ActivityLog({
      userId: newUser._id,
      activity: "Sign-Up",
      description: "New user account created.",
    }).save();

    res.status(201).json({ message: "User created successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Sign-In Route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    // Log Activity
    await new ActivityLog({
      userId: user._id,
      activity: "Sign-In",
      description: "User signed in.",
    }).save();

    res.status(200).json({ message: "Sign-In successful!" });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: "dinushadeshan4@gmail.com", // Replace with your email
    pass: "oqax fsvx gtue mlmb", // Replace with your email password or app password
  },
});

// Reset Password with Email
router.post("/:id/reset-password", async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.username !== username || user.email !== email) {
      return res.status(400).json({ message: "User data mismatch." });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // Token valid for 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    // Construct the password reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send the reset email
    const mailOptions = {
      from: '"Kade.LK Management" <dinushadeshan4@gmail.com>',
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request for ${user.username} </h2>
        <p>Hi ${user.username},</p>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p><strong>Kade Management Team</strong></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Log Activity
    const log = new ActivityLog({
      userId: id,
      activity: "Password Reset",
      description: "Password reset link sent to email.",
    });
    await log.save();

    res.json({ message: "Password reset link sent to your email address.", log });
  } catch (err) {
    console.error("Error sending password reset email:", err.message, err.stack);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Get Activity Logs for a User
router.get("/:id/logs", async (req, res) => {
  const { id } = req.params;
  try {
    const logs = await ActivityLog.find({ userId: id });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;