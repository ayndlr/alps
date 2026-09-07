const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const { auth, adminOnly } = require("../middleware/auth");

router.use(auth, adminOnly);

router.get("/stats", async (req, res) => {
  const [employees, pending, approved, rejected] = await Promise.all([
    Employee.countDocuments(), Leave.countDocuments({ status: "pending" }),
    Leave.countDocuments({ status: "approved" }), Leave.countDocuments({ status: "rejected" })
  ]);
  res.json({ employees, pending, approved, rejected });
});

router.get("/employees", async (req, res) => {
  res.json(await Employee.find().sort({ createdAt: -1 }));
});

router.post("/employees", async (req, res) => {
  try {
    const { employeeId, username, initialPassword, firstName, lastName, department, position, email, phone, dateJoined } = req.body;
    if (!employeeId || !username || !initialPassword || !firstName || !lastName)
      return res.status(400).json({ message: "Employee ID, username, name and initial password are required" });

    const exists = await User.findOne({ $or: [{ username: username.toLowerCase() }, { employeeId }] });
    if (exists) return res.status(409).json({ message: "Username or employee ID already exists" });

    const user = await User.create({
      employeeId, username: username.toLowerCase(),
      passwordHash: await bcrypt.hash(initialPassword, 12),
      role: "employee", firstLogin: true
    });
    const employee = await Employee.create({ userId: user._id, employeeId, firstName, lastName, department, position, email, phone, dateJoined });
    res.status(201).json({ employee, credentials: { username: user.username, initialPassword } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.patch("/employees/:id/status", async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  const user = await User.findById(employee.userId);
  user.status = req.body.status === "inactive" ? "inactive" : "active";
  await user.save();
  res.json({ message: `Employee ${user.status}` });
});

router.get("/leaves", async (req, res) => {
  res.json(await Leave.find().populate("employeeId").sort({ createdAt: -1 }));
});

router.patch("/leaves/:id/review", async (req, res) => {
  const { status, comment = "" } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid review status" });

  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: "Application not found" });
  if (leave.status !== "pending") return res.status(400).json({ message: "Application is no longer pending" });

  leave.status = status; leave.reviewComment = comment;
  leave.reviewedBy = req.user.id; leave.reviewedAt = new Date();
  await leave.save();

  if (status === "approved") {
    const employee = await Employee.findById(leave.employeeId);
    if (leave.leaveType !== "unpaid" && employee.leaveBalances[leave.leaveType] !== undefined) {
      employee.leaveBalances[leave.leaveType] = Math.max(0, employee.leaveBalances[leave.leaveType] - leave.duration);
      await employee.save();
    }
  }
  res.json(leave);
});

module.exports = router;