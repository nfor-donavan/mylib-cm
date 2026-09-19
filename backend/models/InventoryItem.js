const mongoose = require("mongoose");

const InventoryItemSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    barcodeSerial: { type: String, unique: true, required: true }, // barcode stuck on book cover
    shelfLocation: String, // e.g. "Shelf A - Row 3"
    condition: { type: String, enum: ["New", "Good", "Worn", "Damaged"], default: "Good" },
    status: {
      type: String,
      enum: ["Available", "Borrowed", "Reserved", "Damaged", "Lost", "Withdrawn"],
      default: "Available",
    },
    acquiredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

InventoryItemSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model("InventoryItem", InventoryItemSchema);
