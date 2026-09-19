// Swap SMS_PROVIDER to whichever service you've contracted with. Three real
// options are wired in below, plus "console" for local development.
const axios = require("axios");

async function sendSms(phoneNumber, message) {
  const provider = process.env.SMS_PROVIDER || "console";

  if (provider === "console") {
    console.log(`[sms:dev] -> ${phoneNumber}: ${message}`);
    return { success: true, provider: "console" };
  }

  if (provider === "bulksms") {
    // BulkSMS (https://www.bulksms.com) — widely used across Africa,
    // supports MTN/Orange Cameroon routes.
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

  if (provider === "twilio") {
    // Twilio (https://www.twilio.com) — easiest to get a working sandbox
    // account for quickly, though check their current Cameroon coverage
    // and per-SMS pricing before committing to it for production.
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({ To: phoneNumber, From: fromNumber, Body: message }),
      { auth: { username: accountSid, password: authToken } }
    );
    return { success: true, provider: "twilio", id: response.data?.sid };
  }

  if (provider === "webhook") {
    // Generic escape hatch: POSTs { to, message } as JSON to any URL you
    // control (e.g. your own microservice in front of MTN Zigi / Orange SMS
    // API, whose exact request contracts require a signed partner agreement
    // to access — put that integration behind your own endpoint and point
    // SMS_WEBHOOK_URL at it).
    const response = await axios.post(process.env.SMS_WEBHOOK_URL, {
      to: phoneNumber,
      message,
    });
    return { success: true, provider: "webhook", status: response.status };
  }

  throw new Error(`Unknown SMS_PROVIDER "${provider}"`);
}

function buildOverdueMessage({ studentName, bookTitle, lang = "en" }) {
  if (lang === "fr") {
    return `Bonjour ${studentName}, le livre "${bookTitle}" est en retard a la bibliotheque. Merci de le rendre pour eviter des penalites.`;
  }
  return `Hello ${studentName}, the book "${bookTitle}" is overdue at the library. Please return it to avoid daily fines.`;
}

module.exports = { sendSms, buildOverdueMessage };
