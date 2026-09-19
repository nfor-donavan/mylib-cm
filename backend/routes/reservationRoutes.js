const express = require("express");
const {
  createReservation,
  listReservations,
  cancelReservation,
  fulfillReservation,
} = require("../controllers/reservationController");
const { requireAuth, requireRole } = require("../middleware/auth");
const tenantScope = require("../middleware/tenantScope");

const router = express.Router();
router.use(requireAuth, tenantScope);

router.get("/", listReservations);
router.post("/", requireRole("Student", "Teacher"), createReservation);
router.patch("/:id/cancel", cancelReservation);
router.patch("/:id/fulfill", requireRole("Librarian", "SuperAdmin"), fulfillReservation);

module.exports = router;
