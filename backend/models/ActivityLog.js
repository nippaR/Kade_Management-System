const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  activity: { type: String, required: true },
  description: { type: String },
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
