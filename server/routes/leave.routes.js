const router = require("express").Router();
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const { auth } = require("../middleware/auth");

const leaveRules = {
  annual: 30, sick: 14, maternity: 90, paternity: 14,
  compassionate: 7, study: 10, casual: 7, unpaid: 999
};

function workingDays(start, end) {
  let count = 0, d = new Date(start);
  const last = new Date(end);
  d.setHours(0,0,0,0); last.setHours(0,0,0,0);
  while (d <= last) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

router.get("/mine", auth, async (req, res) => {
  const employee = await Employee.findOne({ userId: req.user.id });
  if (!employee) return res.status(404).json({ message: "Employee profile not found" });
  res.json(await Leave.find({ employeeId: employee._id }).sort({ createdAt: -1 }));
});

router.post("/", auth, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });

    const { leaveType, startDate, endDate, reason } = req.body;
    if (!leaveRules[leaveType]) return res.status(400).json({ message: "Invalid leave type" });
    if (!reason?.trim()) return res.status(400).json({ message: "Reason is required" });

    const start = new Date(startDate), end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || end < start)
      return res.status(400).json({ message: "Invalid leave dates" });

    const duration = workingDays(start, end);
    const overlapping = await Leave.findOne({
      employeeId: employee._id,
      status: { $in: ["pending", "approved"] },
      startDate: { $lte: end },
      endDate: { $gte: start }
    });
    if (overlapping) return res.status(400).json({ message: "This period overlaps another leave application" });

    const balance = employee.leaveBalances[leaveType] ?? leaveRules[leaveType];
    if (leaveType !== "unpaid" && duration > balance)
      return res.status(400).json({ message: `Insufficient ${leaveType} leave balance` });

    const leave = await Leave.create({ employeeId: employee._id, leaveType, startDate: start, endDate: end, duration, reason });
    res.status(201).json(leave);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.patch("/:id/cancel", auth, async (req, res) => {
  const employee = await Employee.findOne({ userId: req.user.id });
  const leave = await Leave.findOne({ _id: req.params.id, employeeId: employee?._id });
  if (!leave) return res.status(404).json({ message: "Application not found" });
  if (leave.status !== "pending") return res.status(400).json({ message: "Only pending applications can be cancelled" });
  leave.status = "cancelled";
  await leave.save();
  res.json(leave);
});

module.exports = router;