const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: function () {
        return this.role !== "SuperAdmin";
      },
    },
    matricule: {
      type: String,
      required: function () {
        return this.role !== "SuperAdmin"; // SuperAdmin logs in with email, not a school matricule
      },
    }, // School registration number e.g. "N623/26"
    fullName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["SuperAdmin", "Librarian", "Teacher", "Student"],
      default: "Student",
    },
    phoneNumber: { type: String, required: true }, // Crucial for SMS reminders
    email: { type: String, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    currentClass: String, // e.g. "Form 5", "Terminale C"
    preferredLanguage: { type: String, enum: ["en", "fr"], default: "en" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One matricule per tenant, not globally unique (two schools could share numbering schemes)
UserSchema.index({ tenantId: 1, matricule: 1 }, { unique: true, sparse: true });

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

UserSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

module.exports = mongoose.model("User", UserSchema);
