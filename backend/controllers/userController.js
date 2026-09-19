const User = require("../models/User");

// GET /api/users?role=Student
async function listUsers(req, res) {
  const filter = req.scoped();
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).select("-passwordHash").sort({ fullName: 1 });
  res.json({ users });
}

// PATCH /api/users/:id/reset-password   Body: { newPassword }
// Librarian/Admin resets a student or teacher's password (no self-service
// "forgot password" flow yet, so this is the current recovery path).
async function resetPassword(req, res) {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: "newPassword must be at least 4 characters" });
  }

  const user = await User.findOne(req.scoped({ _id: req.params.id }));
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.role === "SuperAdmin") {
    return res.status(403).json({ error: "Cannot reset a SuperAdmin password from this endpoint" });
  }

  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();

  res.json({ success: true });
}

module.exports = { listUsers, resetPassword };
