const Book = require("../models/Book");
const InventoryItem = require("../models/InventoryItem");

// GET /api/books?search=&category=&language=&targetClass=&page=&limit=
async function listBooks(req, res) {
  const { search, category, language, targetClass, bookType, page = 1, limit = 24 } = req.query;

  const filter = req.scoped();
  if (category) filter.category = category;
  if (language) filter.language = language;
  if (targetClass) filter.targetClass = targetClass;
  if (bookType) filter.bookType = bookType;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  const [books, total] = await Promise.all([
    Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Book.countDocuments(filter),
  ]);

  res.json({ books, total, page: Number(page), pages: Math.ceil(total / limit) });
}

// GET /api/books/:id  — includes live availability across all physical copies
async function getBook(req, res) {
  const book = await Book.findOne(req.scoped({ _id: req.params.id }));
  if (!book) return res.status(404).json({ error: "Book not found" });

  const copies = await InventoryItem.find(req.scoped({ bookId: book._id }));
  const availableCopies = copies.filter((c) => c.status === "Available").length;

  res.json({ book, totalCopies: copies.length, availableCopies });
}

// POST /api/books  (Librarian/Admin)
async function createBook(req, res) {
  const book = await Book.create({ ...req.body, tenantId: req.tenantId });
  res.status(201).json(book);
}

// PUT /api/books/:id  (Librarian/Admin)
async function updateBook(req, res) {
  const book = await Book.findOneAndUpdate(req.scoped({ _id: req.params.id }), req.body, {
    new: true,
    runValidators: true,
  });
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
}

// DELETE /api/books/:id  (Librarian/Admin)
async function deleteBook(req, res) {
  const remainingCopies = await InventoryItem.countDocuments(req.scoped({ bookId: req.params.id }));
  if (remainingCopies > 0) {
    return res.status(409).json({ error: "Withdraw or remove all physical copies before deleting this title" });
  }
  const result = await Book.findOneAndDelete(req.scoped({ _id: req.params.id }));
  if (!result) return res.status(404).json({ error: "Book not found" });
  res.status(204).send();
}

module.exports = { listBooks, getBook, createBook, updateBook, deleteBook };
