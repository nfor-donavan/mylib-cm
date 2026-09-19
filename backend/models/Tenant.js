const mongoose = require("mongoose");

const TenantSchema = new mongoose.Schema(
  {
    schoolName: { type: String, required: true, trim: true }, // e.g. "GHS Buea", "Collège Vogt"
    subdomain: { type: String, unique: true, required: true, lowercase: true, trim: true }, // ghsbuea.mylib.cm
    educationSystem: {
      type: String,
      enum: ["Anglophone", "Francophone", "Bilingual", "Higher_Ed"],
      required: true,
    },
    contactEmail: String,
    contactPhone: String,
    address: String,
    subscriptionTier: {
      type: String,
      enum: ["Trial", "Basic", "Standard", "Premium"],
      default: "Trial",
    },
    subscriptionExpiresAt: Date,
    smsCreditsRemaining: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", TenantSchema);
