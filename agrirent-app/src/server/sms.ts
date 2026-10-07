import type { StoredBooking } from "./storage";
import { maskPhoneNumber } from "../lib/phone";

export type BookingSmsResult =
  | { status: "sent"; maskedPhone: string }
  | { status: "failed"; maskedPhone: string; reason: string }
  | { status: "no_phone" };

type ProviderSmsResult = { sent: true } | { sent: false; reason: string };

interface SmsProvider {
  send(to: string, message: string): Promise<ProviderSmsResult>;
}

function normalizePhoneNumber(phone: string): string | null {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  let internationalDigits: string;

  if (trimmed.startsWith("+")) {
    internationalDigits = digits;
  } else if (digits.length === 10) {
    internationalDigits = `91${digits}`;
  } else if (digits.length === 12 && digits.startsWith("91")) {
    internationalDigits = digits;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    internationalDigits = `91${digits.slice(1)}`;
  } else {
    return null;
  }

  const normalized = `+${internationalDigits}`;
  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}

const twilioProvider: SmsProvider = {
  async send(to, message) {
    const accountSid = process.env["TWILIO_ACCOUNT_SID"]?.trim();
    const authToken = process.env["TWILIO_AUTH_TOKEN"]?.trim();
    const from = process.env["TWILIO_FROM_NUMBER"]?.trim();

    if (!accountSid || !authToken || !from) {
      return {
        sent: false,
        reason: "Twilio is not configured; set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.",
      };
    }
    if (!/^AC[a-f\d]{32}$/i.test(accountSid) || !/^\+[1-9]\d{7,14}$/.test(from)) {
      return { sent: false, reason: "Twilio account SID or sender number is invalid." };
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: message }),
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!response.ok) {
      return { sent: false, reason: `Twilio returned HTTP ${response.status}.` };
    }
    return { sent: true };
  },
};

export async function sendBookingConfirmationSms(
  registeredPhone: string,
  booking: StoredBooking
): Promise<BookingSmsResult> {
  const to = normalizePhoneNumber(registeredPhone);
  if (!to) {
    return { status: "no_phone" };
  }

  const maskedPhone = maskPhoneNumber(to);
  const message = [
    "AgriRent: Your equipment booking is confirmed.",
    `Equipment: ${booking.equipmentName}`,
    `Booking ID: ${booking.id}`,
    `Dates: ${booking.startDate} to ${booking.endDate}`,
    `Total: ₹${booking.totalAmount.toLocaleString("en-IN")}`,
  ].join("\n");

  try {
    const result = await twilioProvider.send(to, message);
    if (!result.sent) {
      return { status: "failed", maskedPhone, reason: result.reason };
    }
    return { status: "sent", maskedPhone };
  } catch {
    return { status: "failed", maskedPhone, reason: "Twilio request failed or timed out." };
  }
}
