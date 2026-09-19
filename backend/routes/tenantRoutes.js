const express = require("express");
const Tenant = require("../models/Tenant");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireRole("SuperAdmin"));

// GET /api/tenants — list all schools on the platform
router.get("/", async (req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });
  res.json({ tenants });
});

// POST /api/tenants — onboard a new school
router.post("/", async (req, res) => {
  const tenant = await Tenant.create(req.body);
  res.status(201).json(tenant);
});

// PATCH /api/tenants/:id — update subscription tier, activate/deactivate, etc.
router.patch("/:id", async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  res.json(tenant);
});

module.exports = router;
