const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT, attaches req.user (lean object) and req.tenantId
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing or malformed Authorization header" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).lean();

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid or inactive account" });
    }

    req.user = user;
    // tenantId is undefined for SuperAdmin, which is expected
    req.tenantId = user.tenantId ? String(user.tenantId) : null;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Usage: requireRole("Librarian", "SuperAdmin")
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
