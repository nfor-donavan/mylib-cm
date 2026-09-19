const express = require("express");
const { syncOfflineCheckouts } = require("../controllers/syncController");
const { requireAuth, requireRole } = require("../middleware/auth");
const tenantScope = require("../middleware/tenantScope");

const router = express.Router();
router.post(
  "/",
  requireAuth,
  tenantScope,
  requireRole("Librarian", "SuperAdmin"),
  syncOfflineCheckouts
);

module.exports = router;
