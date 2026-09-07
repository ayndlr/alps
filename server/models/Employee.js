const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  department: String,
  position: String,
  email: String,
  phone: String,
  dateJoined: Date,
  leaveBalances: {
    annual: { type: Number, default: 30 },
    sick: { type: Number, default: 14 },
    maternity: { type: Number, default: 90 },
    paternity: { type: Number, default: 14 },
    compassionate: { type: Number, default: 7 },
    study: { type: Number, default: 10 },
    casual: { type: Number, default: 7 },
    unpaid: { type: Number, default: 999 }
  }
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);