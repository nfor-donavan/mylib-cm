const mongoose = require("mongoose");

const BorrowingLogSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issuedByLibrarianId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    borrowedAt: { type: Date, default: Date.now },
    expectedReturnDate: { type: Date, required: true },
    actualReturnDate: Date,
    status: { type: String, enum: ["Active", "Returned", "Overdue", "Lost"], default: "Active" },
    smsRemindersSentCount: { type: Number, default: 0 },
    lastReminderSentAt: Date,
    fineAmountXAF: { type: Number, default: 0 },
    // Set when this log was created while the librarian device was offline
    // and later synced up from IndexedDB (see /api/sync).
    createdOffline: { type: Boolean, default: false },
    clientSyncId: String, // idempotency key generated on-device for offline sync
  },
  { timestamps: true }
);

BorrowingLogSchema.index({ tenantId: 1, status: 1 });
BorrowingLogSchema.index({ tenantId: 1, clientSyncId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("BorrowingLog", BorrowingLogSchema);
