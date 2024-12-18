const express = require("express");
const bcrypt = require("bcrypt");
const { User, ActivityLog } = require("../models/User");

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

// Reset Password (Logs Activity)
router.post("/:id/reset-password", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Log Activity
    const log = new ActivityLog({
      userId: id,
      activity: "Password Reset",
      description: "Password reset link sent.",
    });
    await log.save();

    res.json({ message: "Password reset link sent.", log });
  } catch (err) {
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
