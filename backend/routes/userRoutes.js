const express = require("express");
const { listUsers, resetPassword } = require("../controllers/userController");
const { requireAuth, requireRole } = require("../middleware/auth");
const tenantScope = require("../middleware/tenantScope");

const router = express.Router();
router.use(requireAuth, tenantScope, requireRole("Librarian", "SuperAdmin"));

router.get("/", listUsers);
router.patch("/:id/reset-password", resetPassword);

module.exports = router;
