const InventoryItem = require("../models/InventoryItem");

// GET /api/inventory/barcode/:serial  — used by the USB scanner checkout flow
async function findByBarcode(req, res) {
  const item = await InventoryItem.findOne(req.scoped({ barcodeSerial: req.params.serial })).populate(
    "bookId"
  );
  if (!item) return res.status(404).json({ error: "No book copy matches this barcode" });
  res.json(item);
}

// POST /api/inventory  (Librarian/Admin) — register a new physical copy
async function createItem(req, res) {
  const { bookId, barcodeSerial, shelfLocation, condition } = req.body;
  const item = await InventoryItem.create({
    tenantId: req.tenantId,
    bookId,
    barcodeSerial,
    shelfLocation,
    condition,
  });
  res.status(201).json(item);
}

// PATCH /api/inventory/:id/status  (Librarian/Admin) — mark Damaged/Lost/Withdrawn/etc.
async function updateStatus(req, res) {
  const { status } = req.body;
  const item = await InventoryItem.findOneAndUpdate(
    req.scoped({ _id: req.params.id }),
    { status },
    { new: true }
  );
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
}

module.exports = { findByBarcode, createItem, updateStatus };
