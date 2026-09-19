const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

function issueToken(user) {
  return jwt.sign(
    { sub: user._id, role: user.role, tenantId: user.tenantId || null },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
}

// POST /api/auth/login
// Students/teachers log in with matricule + subdomain; librarians/admins can also use email.
async function login(req, res) {
  const { matricule, email, password, subdomain } = req.body;

  if (!password || (!matricule && !email)) {
    return res.status(400).json({ error: "matricule or email, and password, are required" });
  }

  let tenant = null;
  if (subdomain) {
    tenant = await Tenant.findOne({ subdomain: subdomain.toLowerCase(), isActive: true });
    if (!tenant) return res.status(404).json({ error: "School not found or inactive" });
  }

  const query = tenant ? { tenantId: tenant._id } : {};
  if (matricule) query.matricule = matricule;
  if (email) query.email = email.toLowerCase();

  const user = await User.findOne(query);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = issueToken(user);
  res.json({
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
      preferredLanguage: user.preferredLanguage,
    },
  });
}

// POST /api/auth/register-student  (Librarian/Admin only — students don't self-register)
async function registerStudent(req, res) {
  const { matricule, fullName, phoneNumber, email, currentClass, password, preferredLanguage } = req.body;

  if (!matricule || !fullName || !phoneNumber || !password) {
    return res.status(400).json({ error: "matricule, fullName, phoneNumber and password are required" });
  }

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    tenantId: req.tenantId,
    matricule,
    fullName,
    phoneNumber,
    email,
    currentClass,
    preferredLanguage: preferredLanguage || "en",
    role: "Student",
    passwordHash,
  });

  res.status(201).json({ id: user._id, matricule: user.matricule, fullName: user.fullName });
}

// POST /api/auth/register-librarian  (SuperAdmin only — onboarding a school's staff)
async function registerLibrarian(req, res) {
  const { tenantId, matricule, fullName, phoneNumber, email, password, preferredLanguage } = req.body;

  if (!tenantId || !matricule || !fullName || !phoneNumber || !password) {
    return res
      .status(400)
      .json({ error: "tenantId, matricule, fullName, phoneNumber and password are required" });
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    tenantId,
    matricule,
    fullName,
    phoneNumber,
    email,
    preferredLanguage: preferredLanguage || "en",
    role: "Librarian",
    passwordHash,
  });

  res.status(201).json({ id: user._id, matricule: user.matricule, fullName: user.fullName, tenantId });
}

module.exports = { login, registerStudent, registerLibrarian };
