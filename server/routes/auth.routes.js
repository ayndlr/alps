const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: String(username).toLowerCase() });
    if (!user || user.status !== "active" || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: "Invalid username or password" });

    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: "8h" });
    const employee = user.role === "employee" ? await Employee.findOne({ userId: user._id }) : null;

    res.json({ token, user: { id: user._id, username: user.username, role: user.role, firstLogin: user.firstLogin, employee } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/change-password", require("../middleware/auth").auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!(await bcrypt.compare(currentPassword, user.passwordHash)))
      return res.status(400).json({ message: "Current password is incorrect" });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.firstLogin = false;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;