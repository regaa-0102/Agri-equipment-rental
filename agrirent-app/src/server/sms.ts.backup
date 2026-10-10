import type { StoredBooking } from "./storage";
import { maskPhoneNumber } from "../lib/phone";

export type BookingSmsResult =
  | { status: "accepted"; maskedPhone: string }
  | { status: "delivered"; maskedPhone: string }
  | { status: "failed"; maskedPhone: string; reason: string }
  | { status: "no_phone" }
  | { status: "invalid_phone"; maskedPhone: string };

type ProviderSmsResult =
  | { accepted: true; delivered: boolean }
  | {
      accepted: false;
      reason: string;
      httpStatus?: number;
      errorCode?: number;
      errorMessage?: string;
    };

interface SmsProvider {
  send(to: string, message: string): Promise<ProviderSmsResult>;
}

function sanitizeTwilioMessage(
  message: string,
  valuesToRedact: Array<string | undefined>
): string {
  let sanitized = message;
  for (const value of valuesToRedact) {
    if (value) sanitized = sanitized.split(value).join("[redacted]");
  }
  return sanitized
    .replace(/\bBasic\s+[A-Za-z0-9+/=]+/gi, "Basic [redacted]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, (number) => maskPhoneNumber(number))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
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
        accepted: false,
        reason: "Twilio is not configured; set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.",
      };
    }
    if (!/^AC[a-f\d]{32}$/i.test(accountSid) || !/^\+[1-9]\d{7,14}$/.test(from)) {
      return { accepted: false, reason: "Twilio account SID or sender number is invalid." };
    }

    const authorizationHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          authorization: authorizationHeader,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: message }),
        signal: AbortSignal.timeout(10_000),
      }
    );
    const responseText = await response.text();
    let body: { status?: unknown; code?: unknown; message?: unknown } | null = null;
    try {
      body = JSON.parse(responseText) as { status?: unknown; code?: unknown; message?: unknown };
    } catch {
      // Twilio normally responds with JSON; retain only a safe fallback for unexpected bodies.
    }
    if (!response.ok) {
      const errorCode = typeof body?.code === "number" ? body.code : undefined;
      const errorMessage = typeof body?.message === "string"
        ? sanitizeTwilioMessage(body.message, [to, from, accountSid, authToken, authorizationHeader])
        : "Twilio did not provide a structured error message.";
      return {
        accepted: false,
        httpStatus: response.status,
        ...(errorCode !== undefined ? { errorCode } : {}),
        errorMessage,
        reason: `Twilio returned HTTP ${response.status}${errorCode !== undefined ? ` (error ${errorCode})` : ""}.`,
      };
    }
    return { accepted: true, delivered: body?.status === "delivered" };
  },
};

async function sendSms(
  registeredPhone: string,
  message: string,
  operation: string,
  referenceId: string
): Promise<BookingSmsResult> {
  const to = normalizePhoneNumber(registeredPhone);
  if (!to) {
    const maskedPhone = registeredPhone.trim() ? maskPhoneNumber(registeredPhone) : undefined;
    if (maskedPhone) {
      console.warn(`${operation} SMS not sent for ${referenceId} (${maskedPhone}): phone number is invalid.`);
      return { status: "invalid_phone", maskedPhone };
    }
    console.warn(`${operation} SMS not sent for ${referenceId}: no registered phone number is available.`);
    return { status: "no_phone" };
  }

  const maskedPhone = maskPhoneNumber(to);
  try {
    const result = await twilioProvider.send(to, message);
    if (!result.accepted) {
      const twilioDetails = result.httpStatus === undefined
        ? result.reason
        : `HTTP ${result.httpStatus}; Twilio code ${result.errorCode ?? "unavailable"}; message: ${result.errorMessage ?? "unavailable"}`;
      console.warn(`${operation} SMS failed for ${referenceId} (${maskedPhone}): ${twilioDetails}`);
      return { status: "failed", maskedPhone, reason: result.reason };
    }
    const status = result.delivered ? "delivered" : "accepted";
    console.info(`${operation} SMS ${status} by Twilio for ${referenceId} (${maskedPhone}).`);
    return { status, maskedPhone };
  } catch (error) {
    const reason = error instanceof Error && error.name === "TimeoutError"
      ? "Twilio request timed out."
      : "Twilio request failed.";
    console.warn(`${operation} SMS failed for ${referenceId} (${maskedPhone}): ${reason}`);
    return { status: "failed", maskedPhone, reason };
  }
}

export function sendBookingConfirmationSms(
  registeredPhone: string,
  booking: StoredBooking
): Promise<BookingSmsResult> {
  const message = [
    "AgriRent: Your booking for",
    `${booking.equipmentName} has been confirmed successfully.`,
    `Dates: ${booking.startDate} to ${booking.endDate}`,
    `Booking ID: ${booking.id}`,
    "Thank you for using AgriRent!",
  ].join(" ");
  return sendSms(registeredPhone, message, "Booking confirmation", booking.id);
}

export function sendEquipmentRegistrationSms(
  registeredPhone: string,
  listingName: string,
  listingId: string
): Promise<BookingSmsResult> {
  return sendSms(
    registeredPhone,
    `AgriRent: Your equipment ${listingName} has been registered successfully. Thank you for joining AgriRent!`,
    "Equipment registration confirmation",
    listingId
  );
}

export function sendBookingExtensionSms(
  registeredPhone: string,
  booking: StoredBooking
): Promise<BookingSmsResult> {
  const newReturnDate = new Date(`${booking.endDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return sendSms(
    registeredPhone,
    `AgriRent: Your booking for ${booking.equipmentName} has been extended successfully. Your new return date is ${newReturnDate}.`,
    "Booking extension confirmation",
    booking.id
  );
}

export function sendBookingDecisionSms(
  registeredPhone: string,
  booking: StoredBooking,
  decision: "approved" | "rejected"
): Promise<BookingSmsResult> {
  const message = decision === "approved"
    ? `AgriRent: Your booking for ${booking.equipmentName} (ID ${booking.id}) has been approved. Rental starts ${booking.startDate}.`
    : `AgriRent: Your booking for ${booking.equipmentName} (ID ${booking.id}) has been rejected.`;
  return sendSms(registeredPhone, message, `Booking ${decision}`, booking.id);
}

export function sendBookingReminderSms(
  registeredPhone: string,
  booking: StoredBooking
): Promise<BookingSmsResult> {
  return sendSms(
    registeredPhone,
    `AgriRent reminder: Your rental of ${booking.equipmentName} (ID ${booking.id}) starts ${booking.startDate}.`,
    "Booking reminder",
    booking.id
  );
}
