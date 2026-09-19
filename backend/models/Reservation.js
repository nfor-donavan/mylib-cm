const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Active", "Fulfilled", "Cancelled"], default: "Active" },
    fulfilledAt: Date,
  },
  { timestamps: true }
);

// One active reservation per student per title
ReservationSchema.index({ tenantId: 1, bookId: 1, userId: 1, status: 1 });

module.exports = mongoose.model("Reservation", ReservationSchema);
