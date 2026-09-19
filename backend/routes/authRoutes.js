const express = require("express");
const { login, registerStudent, registerLibrarian } = require("../controllers/authController");
const { requireAuth, requireRole } = require("../middleware/auth");
const tenantScope = require("../middleware/tenantScope");

const router = express.Router();

router.post("/login", login);
router.post(
  "/register-student",
  requireAuth,
  tenantScope,
  requireRole("Librarian", "SuperAdmin"),
  registerStudent
);
// SuperAdmin onboards a school's librarian account after creating the tenant
// via POST /api/tenants. No tenantScope here — SuperAdmin passes tenantId
// explicitly in the body since they aren't scoped to any one school.
router.post("/register-librarian", requireAuth, requireRole("SuperAdmin"), registerLibrarian);

module.exports = router;
