require("dotenv").config();
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/leaves", require("./routes/leave.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../client/index.html")));

async function start() {
  await connectDB();
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    await User.create({
      username: process.env.ADMIN_USERNAME || "admin",
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin12345", 12),
      role: "admin", firstLogin: false
    });
    console.log("Default admin created");
  }
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`LeaveFlow running at http://localhost:${port}`));
}
start().catch(err => { console.error(err); process.exit(1); });