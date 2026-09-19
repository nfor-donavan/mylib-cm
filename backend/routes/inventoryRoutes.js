const express = require("express");
const {
  findByBarcode,
  createItem,
  updateStatus,
} = require("../controllers/inventoryController");
const { requireAuth, requireRole } = require("../middleware/auth");
const tenantScope = require("../middleware/tenantScope");

const router = express.Router();
router.use(requireAuth, tenantScope, requireRole("Librarian", "SuperAdmin"));

router.get("/barcode/:serial", findByBarcode);
router.post("/", createItem);
router.patch("/:id/status", updateStatus);

module.exports = router;
