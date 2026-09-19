// Run once, locally, to create your own first SuperAdmin login. Does not
// create any tenant, school, book or demo data — just this one account.
//
// Usage:
//   node scripts/create-superadmin.js --email you@example.com --password "a-strong-password" --name "Your Name"

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg, i, arr) => {
    if (arg.startsWith("--")) args[arg.slice(2)] = arr[i + 1];
  });
  return args;
}

async function run() {
  const { email, password, name, phone } = parseArgs();

  if (!email || !password || !name) {
    console.error("Usage: node scripts/create-superadmin.js --email you@example.com --password \"...\" --name \"Your Name\" [--phone +237...]");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase(), role: "SuperAdmin" });
  if (existing) {
    console.error(`A SuperAdmin with email ${email} already exists.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    fullName: name,
    email: email.toLowerCase(),
    phoneNumber: phone || "N/A",
    matricule: "SUPERADMIN",
    role: "SuperAdmin",
    passwordHash,
  });

  console.log(`SuperAdmin created: ${user.email}`);
  console.log("Log in via POST /api/auth/login with { email, password } (no subdomain needed).");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
