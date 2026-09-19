const BorrowingLog = require("../models/BorrowingLog");
const InventoryItem = require("../models/InventoryItem");
const User = require("../models/User");

const DEFAULT_LOAN_DAYS = 14;

// POST /api/sync
// Body: { checkouts: [{ clientSyncId, barcodeSerial, userMatricule, borrowedAt, loanDays }] }
//
// Each queued checkout carries a clientSyncId generated on-device (e.g. a UUID
// created at the moment the librarian scanned the book while offline). That
// field has a unique index on BorrowingLog, so replaying the same sync
// request twice (e.g. after a flaky connection) is safe and idempotent.
async function syncOfflineCheckouts(req, res) {
  const { checkouts } = req.body;
  if (!Array.isArray(checkouts)) {
    return res.status(400).json({ error: "Body must include a `checkouts` array" });
  }

  const results = [];

  for (const entry of checkouts) {
    try {
      const existing = await BorrowingLog.findOne(
        req.scoped({ clientSyncId: entry.clientSyncId })
      );
      if (existing) {
        results.push({ clientSyncId: entry.clientSyncId, status: "already_synced" });
        continue;
      }

      const item = await InventoryItem.findOne(req.scoped({ barcodeSerial: entry.barcodeSerial }));
      if (!item) {
        results.push({ clientSyncId: entry.clientSyncId, status: "error", error: "Unknown barcode" });
        continue;
      }

      const borrower = await User.findOne(req.scoped({ matricule: entry.userMatricule }));
      if (!borrower) {
        results.push({ clientSyncId: entry.clientSyncId, status: "error", error: "Unknown matricule" });
        continue;
      }

      const borrowedAt = entry.borrowedAt ? new Date(entry.borrowedAt) : new Date();
      const expectedReturnDate = new Date(borrowedAt);
      expectedReturnDate.setDate(expectedReturnDate.getDate() + (entry.loanDays || DEFAULT_LOAN_DAYS));

      await BorrowingLog.create({
        tenantId: req.tenantId,
        itemId: item._id,
        userId: borrower._id,
        issuedByLibrarianId: req.user._id,
        borrowedAt,
        expectedReturnDate,
        createdOffline: true,
        clientSyncId: entry.clientSyncId,
      });

      // Only flip status if the item wasn't already reassigned in the meantime
      if (item.status === "Available") {
        item.status = "Borrowed";
        await item.save();
      }

      results.push({ clientSyncId: entry.clientSyncId, status: "synced" });
    } catch (err) {
      results.push({ clientSyncId: entry.clientSyncId, status: "error", error: err.message });
    }
  }

  res.json({ results });
}

module.exports = { syncOfflineCheckouts };
