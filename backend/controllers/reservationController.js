const Reservation = require("../models/Reservation");
const InventoryItem = require("../models/InventoryItem");

// POST /api/reservations   Body: { bookId }   (Student/Teacher)
async function createReservation(req, res) {
  const { bookId } = req.body;
  if (!bookId) return res.status(400).json({ error: "bookId is required" });

  const existing = await Reservation.findOne(
    req.scoped({ bookId, userId: req.user._id, status: "Active" })
  );
  if (existing) return res.status(409).json({ error: "You already have an active reservation for this title" });

  const reservation = await Reservation.create({
    tenantId: req.tenantId,
    bookId,
    userId: req.user._id,
  });

  res.status(201).json(reservation);
}

// GET /api/reservations   — students see their own; librarians see everyone's queue
async function listReservations(req, res) {
  const filter = req.scoped({ status: "Active" });
  if (req.user.role === "Student" || req.user.role === "Teacher") {
    filter.userId = req.user._id;
  }

  const reservations = await Reservation.find(filter)
    .populate("bookId")
    .populate("userId", "fullName matricule phoneNumber")
    .sort({ createdAt: 1 }); // first-come-first-served queue order

  res.json({ reservations });
}

// PATCH /api/reservations/:id/cancel
async function cancelReservation(req, res) {
  const filter = req.scoped({ _id: req.params.id, status: "Active" });
  // Students may only cancel their own reservation; librarians can cancel any.
  if (req.user.role === "Student" || req.user.role === "Teacher") {
    filter.userId = req.user._id;
  }

  const reservation = await Reservation.findOneAndUpdate(filter, { status: "Cancelled" }, { new: true });
  if (!reservation) return res.status(404).json({ error: "Active reservation not found" });
  res.json(reservation);
}

// PATCH /api/reservations/:id/fulfill   (Librarian/Admin) — marks it fulfilled
// once the librarian has physically handed the returned copy to this student
// (the actual checkout is still done via the normal barcode scan flow).
async function fulfillReservation(req, res) {
  const reservation = await Reservation.findOneAndUpdate(
    req.scoped({ _id: req.params.id, status: "Active" }),
    { status: "Fulfilled", fulfilledAt: new Date() },
    { new: true }
  );
  if (!reservation) return res.status(404).json({ error: "Active reservation not found" });
  res.json(reservation);
}

module.exports = { createReservation, listReservations, cancelReservation, fulfillReservation };
