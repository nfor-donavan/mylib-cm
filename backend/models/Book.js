const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: String,
    coverImageUrl: String,
    publicationYear: Number,
    publisher: String,
    language: { type: String, enum: ["English", "French", "Bilingual", "Other"], default: "English" },

    // Broad catalog category — not just curriculum textbooks
    category: {
      type: String,
      enum: [
        "Curriculum_Textbook", // official MINESEC / school booklist
        "Past_Paper", // Concours, GCE, BEPC, Baccalauréat past papers
        "Fiction_Novel",
        "Reference", // dictionaries, encyclopedias, atlases
        "Periodical", // magazines, newspapers
        "Religious", // Bible, Quran, catechism, etc.
        "Career_Guidance",
        "Biography",
        "Childrens_Book",
        "Other",
      ],
      required: true,
      default: "Curriculum_Textbook",
    },

    subject: String, // e.g. "Mathematics", "Littérature" — mainly for curriculum/reference
    isCurriculumBook: { type: Boolean, default: false }, // kept for back-compat / quick filtering
    targetClass: String, // e.g. "Upper Sixth", "Troisième" — only relevant for curriculum books
    genre: String, // for fiction: "Adventure", "Romance", "Sci-Fi", etc.

    bookType: { type: String, enum: ["Physical", "Digital_PDF"], default: "Physical" },
    pdfUrl: String, // secure hosted file URL for digital textbooks/past papers/magazines
    summary: String,
    tags: [String],
  },
  { timestamps: true }
);

BookSchema.index({ tenantId: 1, title: "text", author: "text", tags: "text" });
BookSchema.index({ tenantId: 1, category: 1 });

module.exports = mongoose.model("Book", BookSchema);
