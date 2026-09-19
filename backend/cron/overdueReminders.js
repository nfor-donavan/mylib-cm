const cron = require("node-cron");
const BorrowingLog = require("../models/BorrowingLog");
const InventoryItem = require("../models/InventoryItem");
const Book = require("../models/Book");
const User = require("../models/User");
const { sendSms, buildOverdueMessage } = require("../utils/sms");

async function runOverdueSweep() {
  const now = new Date();

  const overdueLogs = await BorrowingLog.find({
    status: "Active",
    expectedReturnDate: { $lt: now },
  });

  console.log(`[cron] Overdue sweep found ${overdueLogs.length} loan(s) past due`);

  for (const log of overdueLogs) {
    try {
      log.status = "Overdue";

      const [item, borrower] = await Promise.all([
        InventoryItem.findById(log.itemId),
        User.findById(log.userId),
      ]);
      if (!item || !borrower) {
        await log.save();
        continue;
      }

      const book = await Book.findById(item.bookId);

      const message = buildOverdueMessage({
        studentName: borrower.fullName,
        bookTitle: book ? book.title : "a library book",
        lang: borrower.preferredLanguage,
      });

      await sendSms(borrower.phoneNumber, message);

      log.smsRemindersSentCount += 1;
      log.lastReminderSentAt = now;
      await log.save();
    } catch (err) {
      console.error(`[cron] Failed to process overdue log ${log._id}:`, err.message);
    }
  }
}

// Runs every day at 08:00 server time. Adjust the timezone via TZ env var
// or pass { timezone: "Africa/Douala" } if the host's system TZ differs.
function scheduleOverdueReminders() {
  cron.schedule("0 8 * * *", () => {
    console.log("[cron] Running 8:00 AM overdue reminder sweep");
    runOverdueSweep().catch((err) => console.error("[cron] Sweep failed:", err));
  });
  console.log("[cron] Overdue reminder job scheduled for 08:00 daily");
}

module.exports = { scheduleOverdueReminders, runOverdueSweep };
