require("dotenv").config();
require("express-async-errors"); // lets async controller throws reach the error handler below
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { scheduleOverdueReminders } = require("./cron/overdueReminders");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const borrowingRoutes = require("./routes/borrowingRoutes");
const syncRoutes = require("./routes/syncRoutes");
const tenantRoutes = require("./routes/tenantRoutes");

const app = express();

app.use(helmet());

// Only these origins may call the API. Add each deployed frontend URL here
// (and any local dev ports you use) via the FRONTEND_URLS env var, comma-separated.
// Example: FRONTEND_URLS=https://librarian.onrender.com,https://students.onrender.com
const allowedOrigins = (process.env.FRONTEND_URLS || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server / curl / health checks with no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/borrowing", borrowingRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/tenants", tenantRoutes);

// Central error handler — keeps controllers free of repetitive try/catch noise
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Library backend running on port ${PORT}`);
      scheduleOverdueReminders();
    });
  })
  .catch((err) => {
    console.error("[server] Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

module.exports = app;
