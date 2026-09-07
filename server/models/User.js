const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, sparse: true },
  username: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "employee"], default: "employee" },
  firstLogin: { type: Boolean, default: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);