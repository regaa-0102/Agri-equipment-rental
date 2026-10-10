import { storage } from "./storage";
import { sendBookingReminderSms } from "./sms";

const REMINDER_INTERVAL_MS = 60_000;
let reminderTimer: ReturnType<typeof setInterval> | undefined;
let reminderRunInProgress = false;

export async function runDueBookingReminders(now = Date.now()): Promise<void> {
  if (reminderRunInProgress) return;
  reminderRunInProgress = true;
  try {
    const today = new Date(now).toISOString().slice(0, 10);
    const bookings = storage.getBookings();
    for (const booking of bookings) {
      if (booking.status !== "active" && booking.status !== "approved") continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.startDate) || booking.startDate < today) continue;

      const startsAt = Date.parse(`${booking.startDate}T00:00:00.000Z`);
      const reminderDueAt = startsAt - 24 * 60 * 60 * 1000;
      if (!Number.isFinite(startsAt) || now < reminderDueAt || now >= startsAt) continue;

      let claimed: boolean;
      try {
        claimed = storage.claimSmsNotificationEvent(`booking-reminder:${booking.id}`);
      } catch {
        console.error(`Could not reserve booking reminder SMS for ${booking.id}.`);
        continue;
      }
      if (!claimed) continue;

      const farmer = storage.findUserById(booking.farmerId);
      try {
        await sendBookingReminderSms(farmer?.phone || "", booking);
      } catch {
        console.warn(`Booking reminder SMS failed for ${booking.id}: provider request failed unexpectedly.`);
      }
    }
  } finally {
    reminderRunInProgress = false;
  }
}

export function startRentalReminderScheduler(): void {
  if (reminderTimer) return;
  reminderTimer = setInterval(() => {
    void runDueBookingReminders().catch(() => {
      console.error("Rental reminder scheduler run failed.");
    });
  }, REMINDER_INTERVAL_MS);
  reminderTimer.unref?.();
  void runDueBookingReminders().catch(() => {
    console.error("Initial rental reminder scheduler run failed.");
  });
}
