const BorrowingLog = require("../models/BorrowingLog");
const InventoryItem = require("../models/InventoryItem");

const DEFAULT_LOAN_DAYS = 14;

// POST /api/borrowing/checkout
// Body: { barcodeSerial, userMatricule, loanDays? }
// This is what the barcode scanner hook (frontend) calls on every Enter keypress.
async function checkout(req, res) {
  const { barcodeSerial, userMatricule, loanDays } = req.body;
  const User = require("../models/User");

  const item = await InventoryItem.findOne(req.scoped({ barcodeSerial }));
  if (!item) return res.status(404).json({ error: "Unknown barcode" });
  if (item.status !== "Available") {
    return res.status(409).json({ error: `This copy is currently ${item.status.toLowerCase()}` });
  }

  const borrower = await User.findOne(req.scoped({ matricule: userMatricule }));
  if (!borrower) return res.status(404).json({ error: "Unknown student/teacher matricule" });

  const expectedReturnDate = new Date();
  expectedReturnDate.setDate(expectedReturnDate.getDate() + (loanDays || DEFAULT_LOAN_DAYS));

  const log = await BorrowingLog.create({
    tenantId: req.tenantId,
    itemId: item._id,
    userId: borrower._id,
    issuedByLibrarianId: req.user._id,
    expectedReturnDate,
  });

  item.status = "Borrowed";
  await item.save();

  res.status(201).json({ log, borrower: borrower.fullName, expectedReturnDate });
}

// POST /api/borrowing/return
// Body: { barcodeSerial }
async function returnBook(req, res) {
  const { barcodeSerial } = req.body;

  const item = await InventoryItem.findOne(req.scoped({ barcodeSerial }));
  if (!item) return res.status(404).json({ error: "Unknown barcode" });

  const log = await BorrowingLog.findOne(req.scoped({ itemId: item._id, status: { $in: ["Active", "Overdue"] } }));
  if (!log) return res.status(409).json({ error: "This copy has no active loan on record" });

  log.status = "Returned";
  log.actualReturnDate = new Date();
  await log.save();

  item.status = "Available";
  await item.save();

  res.json({ log });
}

// GET /api/borrowing/active?userId=  — a student's active loans, or all active loans for librarians
async function listActive(req, res) {
  const filter = req.scoped({ status: { $in: ["Active", "Overdue"] } });
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.user.role === "Student" || req.user.role === "Teacher") filter.userId = req.user._id;

  const logs = await BorrowingLog.find(filter)
    .populate({ path: "itemId", populate: { path: "bookId" } })
    .sort({ expectedReturnDate: 1 });

  res.json({ logs });
}

// GET /api/borrowing/fines   (Librarian/Admin) — outstanding fines, unpaid first
async function listFines(req, res) {
  const logs = await BorrowingLog.find(req.scoped({ fineAmountXAF: { $gt: 0 } }))
    .populate({ path: "itemId", populate: { path: "bookId" } })
    .populate("userId", "fullName matricule phoneNumber")
    .sort({ finePaid: 1, expectedReturnDate: 1 });

  res.json({ logs });
}

// PATCH /api/borrowing/:id/pay-fine   (Librarian/Admin)
async function payFine(req, res) {
  const log = await BorrowingLog.findOneAndUpdate(
    req.scoped({ _id: req.params.id }),
    { finePaid: true, finePaidAt: new Date() },
    { new: true }
  );
  if (!log) return res.status(404).json({ error: "Loan record not found" });
  res.json(log);
}

module.exports = { checkout, returnBook, listActive, listFines, payFine };
