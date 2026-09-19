const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to your .env file (see .env.example).");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    // Modern Mongoose (6+) no longer needs useNewUrlParser/useUnifiedTopology
  });

  console.log(`[db] Connected to MongoDB: ${mongoose.connection.name}`);

  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err);
  });
}

module.exports = connectDB;
