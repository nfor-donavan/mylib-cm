const express = require("express");
const {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const { requireAuth, requireRole } = require("../middleware/auth");
const tenantScope = require("../middleware/tenantScope");

const router = express.Router();
router.use(requireAuth, tenantScope);

router.get("/", listBooks);
router.get("/:id", getBook);
router.post("/", requireRole("Librarian", "SuperAdmin"), createBook);
router.put("/:id", requireRole("Librarian", "SuperAdmin"), updateBook);
router.delete("/:id", requireRole("Librarian", "SuperAdmin"), deleteBook);

module.exports = router;
