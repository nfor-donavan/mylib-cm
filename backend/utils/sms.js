// Swap the body of sendSms() for whichever local provider you contract with —
// MTN Zigi, Orange SMS API, or an aggregator like BulkSMS. Keeping this as a
// single function means the rest of the app never needs to know which one is
// in use.
const axios = require("axios");

async function sendSms(phoneNumber, message) {
  const provider = process.env.SMS_PROVIDER || "console"; // "console" for local dev

  if (provider === "console") {
    console.log(`[sms:dev] -> ${phoneNumber}: ${message}`);
    return { success: true, provider: "console" };
  }

  if (provider === "bulksms") {
    const response = await axios.post(
      "https://api.bulksms.com/v1/messages",
      { to: phoneNumber, body: message },
      {
        auth: {
          username: process.env.BULKSMS_USERNAME,
          password: process.env.BULKSMS_PASSWORD,
        },
      }
    );
    return { success: true, provider: "bulksms", id: response.data?.id };
  }

  // Placeholder for MTN Zigi / Orange SMS API integration — fill in once you
  // have API credentials and the provider's exact request contract.
  throw new Error(`Unknown SMS_PROVIDER "${provider}"`);
}

function buildOverdueMessage({ studentName, bookTitle, lang = "en" }) {
  if (lang === "fr") {
    return `Bonjour ${studentName}, le livre "${bookTitle}" est en retard a la bibliotheque. Merci de le rendre pour eviter des penalites.`;
  }
  return `Hello ${studentName}, the book "${bookTitle}" is overdue at the library. Please return it to avoid daily fines.`;
}

module.exports = { sendSms, buildOverdueMessage };
