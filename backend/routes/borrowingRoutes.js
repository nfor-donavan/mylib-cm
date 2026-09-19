const express = require("express");
const { checkout, returnBook, listActive } = require("../controllers/borrowingController");
const { requireAuth, requireRole } = require("../middleware/auth");
const tenantScope = require("../middleware/tenantScope");

const router = express.Router();
router.use(requireAuth, tenantScope);

router.get("/active", listActive); // students see their own; librarians see all
router.post("/checkout", requireRole("Librarian", "SuperAdmin"), checkout);
router.post("/return", requireRole("Librarian", "SuperAdmin"), returnBook);

module.exports = router;
