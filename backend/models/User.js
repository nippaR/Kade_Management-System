const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "path/to/defaultPicture.jpg" },
  role: { type: String, enum: ["Admin", "Assistant"], default: "Assistant" }, // Added role
  createdAt: { type: Date, default: Date.now }, // Added createdAt
});

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  activity: { type: String, required: true },
  description: { type: String },
});

// Create models
const User = mongoose.model("User", userSchema);
const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

// Export models
module.exports = { User, ActivityLog };
