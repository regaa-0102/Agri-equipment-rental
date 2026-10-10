import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { decodeJwt, signJwt, verifyJwt, type JwtPayload } from "./jwt";
import { hashPassword, verifyPassword, storage, type StoredListing, type StoredUser, type StoredBooking } from "./storage";
import {
  sendBookingDecisionSms,
  sendBookingConfirmationSms,
  sendBookingExtensionSms,
  sendEquipmentRegistrationSms,
  type BookingSmsResult,
} from "./sms";
import { DEMO_OTP_ROLE_EMAIL } from "../lib/auth-config";
import { normalizeIndianMobileNumber } from "../lib/phone";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization, Idempotency-Key",
};

type AuthRole = StoredUser["role"];

function isAuthRole(role: unknown): role is AuthRole {
  return role === "farmer" || role === "owner" || role === "admin";
}

function googleTestRoleSwitchEnabled(): boolean {
  return process.env["GOOGLE_TEST_ROLE_SWITCH"]?.trim().toLowerCase() === "true";
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function getIdempotencyKey(request: Request): string | null {
  const key = request.headers.get("Idempotency-Key");
  return key && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)
    ? key
    : null;
}

async function sendSmsForEvent(
  eventId: string,
  operation: string,
  send: () => Promise<BookingSmsResult>
): Promise<BookingSmsResult | null> {
  try {
    if (!storage.claimSmsNotificationEvent(eventId)) return null;
  } catch {
    console.error(`${operation} SMS could not reserve its duplicate-prevention record.`);
    return { status: "failed", maskedPhone: "******", reason: "SMS notification could not be reserved." };
  }
  try {
    return await send();
  } catch {
    console.warn(`${operation} SMS failed: provider request failed unexpectedly.`);
    return { status: "failed", maskedPhone: "******", reason: "SMS provider request failed." };
  }
}

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data), { status, headers: { ...jsonHeaders, ...extraHeaders } });
}

async function readBody<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function getJwtFromHeader(request: Request): JwtPayload | null {
  const cookie = request.headers.get("cookie") || "";
  const token = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("agrirent_session="))
    ?.slice("agrirent_session=".length);
  if (!token) return null;
  const claims = verifyJwt(token);
  if (!claims) return null;
  const user = storage.findUserById(claims.userId);
  const isDemoOtpRole = user?.email.toLowerCase() === DEMO_OTP_ROLE_EMAIL &&
    (claims.role === "farmer" || claims.role === "owner" || claims.role === "admin");
  const isGoogleTestRole = googleTestRoleSwitchEnabled() &&
    claims.provider === "google" &&
    user?.provider === "google" &&
    Boolean(user.googleId) &&
    isAuthRole(claims.role);
  if (!user || user.status !== "active" || (user.role !== claims.role && !isDemoOtpRole && !isGoogleTestRole)) {
    return null;
  }
  return {
    ...claims,
    name: user.name,
    email: user.email,
    role: claims.role,
    provider: user.provider || "local",
  };
}

function sessionCookie(token: string, request: Request, maxAge = 30 * 24 * 60 * 60): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `agrirent_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function cookieValue(request: Request, name: string): string | null {
  return (request.headers.get("cookie") || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || null;
}

function clearCookie(name: string, request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${name}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`;
}

function jsonWithCookies(data: unknown, status: number, cookies: string[]): Response {
  const headers = new Headers(jsonHeaders);
  for (const cookie of cookies) headers.append("set-cookie", cookie);
  return new Response(JSON.stringify(data), { status, headers });
}

function googleRedirect(request: Request, result: string, cookies: string[] = []): Response {
  const url = new URL("/login", request.url);
  url.searchParams.set("google", result);
  const headers = new Headers({ location: url.toString() });
  for (const cookie of cookies) headers.append("set-cookie", cookie);
  return new Response(null, { status: 302, headers });
}

function googleConfiguration() {
  const clientId = process.env["GOOGLE_CLIENT_ID"]?.trim();
  const clientSecret = process.env["GOOGLE_CLIENT_SECRET"]?.trim();
  const redirectUri = process.env["GOOGLE_REDIRECT_URI"]?.trim();
  if (!clientId || !clientSecret || !redirectUri) return null;
  try {
    const parsed = new URL(redirectUri);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      return null;
    }
    if (parsed.pathname !== "/api/auth/google/callback" || parsed.search || parsed.hash) {
      return null;
    }
  } catch {
    return null;
  }
  return { clientId, clientSecret, redirectUri };
}

const emailOtpPepper = randomBytes(32);
const emailOtps = new Map<string, { hash: Buffer; expiresAt: number; attempts: number; role: AuthRole | null }>();
const contactEmailOtps = new Map<string, { email: string; phone: string; hash: Buffer; expiresAt: number; attempts: number }>();
const emailOtpRateLimits = new Map<string, number[]>();
let lastEmailOtpCleanup = 0;

function checkEmailOtpRateLimit(key: string, limit: number, windowMs: number, now: number): boolean {
  const recent = (emailOtpRateLimits.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= limit) {
    emailOtpRateLimits.set(key, recent);
    return false;
  }
  recent.push(now);
  emailOtpRateLimits.set(key, recent);
  return true;
}

function cleanupEmailOtpState(now: number): void {
  if (now - lastEmailOtpCleanup < 60_000) return;
  lastEmailOtpCleanup = now;
  for (const [email, otp] of emailOtps) {
    if (otp.expiresAt <= now) emailOtps.delete(email);
  }
  for (const [userId, otp] of contactEmailOtps) {
    if (otp.expiresAt <= now) contactEmailOtps.delete(userId);
  }
  for (const [key, timestamps] of emailOtpRateLimits) {
    const recent = timestamps.filter((timestamp) => now - timestamp < 15 * 60_000);
    if (recent.length) emailOtpRateLimits.set(key, recent);
    else emailOtpRateLimits.delete(key);
  }
}

function hashEmailOtp(email: string, code: string): Buffer {
  return createHmac("sha256", emailOtpPepper).update(`${email}:${code}`).digest();
}

async function sendEmailOtp(email: string, code: string, purpose: "signin" | "change-email" = "signin"): Promise<boolean> {
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  const from = process.env["AUTH_EMAIL_FROM"]?.trim();
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: purpose === "change-email" ? "Verify your new AgriRent email address" : "Your AgriRent sign-in code",
      text: purpose === "change-email"
        ? `Your AgriRent email change verification code is ${code}. It expires in 5 minutes. Your email address will not change until you verify this code. If you did not request this, you can ignore this email.`
        : `Your AgriRent sign-in code is ${code}. It expires in 5 minutes. If you did not request it, you can ignore this email.`,
    }),
  });
  return response.ok;
}

function pdfText(value: string): string {
  return value
    .replace(/₹/g, "Rs. ")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/([\\()])/g, "\\$1");
}

function createBookingInvoicePdf(booking: StoredBooking, farmerEmail: string, category: string, ownerEmail: string): Buffer {
  const invoiceNumber = `INV-${booking.id}`;
  const invoiceDate = new Date(booking.createdAt).toISOString().slice(0, 10);
  const rows: [string, string][] = [
    ["Invoice number", invoiceNumber],
    ["Booking ID", booking.id],
    ["Invoice date", invoiceDate],
    ["Customer", booking.farmerName],
    ["Customer email", farmerEmail],
    ["Equipment", booking.equipmentName],
    ["Category", category],
    ["Equipment owner", booking.ownerName],
    ...(ownerEmail ? [["Owner email", ownerEmail] as [string, string]] : []),
    ["Rental start date", booking.startDate],
    ["Rental end date", booking.endDate],
    ["Rental duration", `${booking.days} day${booking.days === 1 ? "" : "s"}`],
    ["Rental price", `Rs. ${booking.dailyRate.toLocaleString("en-IN")} / day`],
    ["Total amount", `Rs. ${booking.totalAmount.toLocaleString("en-IN")}`],
    ["Booking status", booking.status.toUpperCase()],
  ];

  const commands = [
    "0.08 0.35 0.18 rg 0 744 612 48 re f",
    "1 1 1 rg",
    "BT /F1 20 Tf 48 762 Td (AgriRent) Tj ET",
    "0.08 0.35 0.18 rg",
    "BT /F1 10 Tf 48 724 Td (Booking Invoice) Tj ET",
    "0 0 0 rg",
  ];
  let y = 696;
  for (const [label, value] of rows) {
    commands.push(`BT /F1 10 Tf 48 ${y} Td (${pdfText(label)}) Tj ET`);
    commands.push(`BT /F1 10 Tf 210 ${y} Td (${pdfText(value)}) Tj ET`);
    y -= 30;
  }
  commands.push("0.55 0.6 0.55 RG 48 72 m 564 72 l S");
  commands.push("BT /F1 9 Tf 48 54 Td (Thank you for booking with AgriRent.) Tj ET");
  const content = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`,
  ];

  let document = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(document, "ascii"));
    document += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(document, "ascii");
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    document += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(document, "ascii");
}

async function sendBookingInvoiceEmail(
  email: string,
  booking: StoredBooking,
  invoicePdf: Buffer
): Promise<boolean> {
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  const from = process.env["AUTH_EMAIL_FROM"]?.trim();
  if (!apiKey || !from) {
    console.warn(`Booking invoice email not sent for ${booking.id}: Resend is not configured.`);
    return false;
  }

  const invoiceNumber = `INV-${booking.id}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `AgriRent Booking Invoice - ${invoiceNumber}`,
      text: `Hello ${booking.farmerName},\n\nYour booking ${booking.id} for ${booking.equipmentName} is confirmed. The invoice PDF is attached.\n\nAgriRent`,
      attachments: [{
        filename: `${invoiceNumber}.pdf`,
        content: invoicePdf.toString("base64"),
      }],
    }),
  });
  if (!response.ok) {
    console.error(`Booking invoice email failed for ${booking.id}: Resend returned HTTP ${response.status}.`);
  }
  return response.ok;
}

function isEqualSecret(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// -------------------------------------------------------------
// Live Agricultural Weather & Spray Suitability Index
// -------------------------------------------------------------
const WEATHER_DATABASE: Record<string, { temp: number; humidity: number; windSpeed: number; rainProb: number; condition: string; conditionTa: string }> = {
  Coimbatore: { temp: 29, humidity: 62, windSpeed: 8, rainProb: 10, condition: "Partly Cloudy", conditionTa: "பகுதி மேகமூட்டம்" },
  Thanjavur: { temp: 33, humidity: 71, windSpeed: 11, rainProb: 15, condition: "Humid & Sunny", conditionTa: "வெப்பமும் ஈரப்பதமும்" },
  Madurai: { temp: 35, humidity: 55, windSpeed: 9, rainProb: 5, condition: "Sunny & Clear", conditionTa: "தெளிவான வெயில்" },
  Salem: { temp: 31, humidity: 64, windSpeed: 7, rainProb: 12, condition: "Optimal Breezy", conditionTa: "மென்மையான தென்றல்" },
  Tiruchirappalli: { temp: 34, humidity: 68, windSpeed: 10, rainProb: 8, condition: "Clear Sky", conditionTa: "தெளிவான வானம்" },
  Pune: { temp: 27, humidity: 58, windSpeed: 12, rainProb: 20, condition: "Pleasant", conditionTa: "இதமான வானிலை" },
  Ludhiana: { temp: 30, humidity: 48, windSpeed: 6, rainProb: 5, condition: "Sunny", conditionTa: "வெயில்" },
};

function calculateSpraySuitability(weather: { temp: number; humidity: number; windSpeed: number; rainProb: number }) {
  // Best spray conditions: wind < 15 km/h, rain < 25%, temp < 36°C
  const windOk = weather.windSpeed <= 15;
  const rainOk = weather.rainProb <= 25;
  const tempOk = weather.temp <= 36;
  const suitable = windOk && rainOk && tempOk;

  let adviceEn = "Optimal conditions for agricultural drone & boom spraying. Negligible chemical drift risk.";
  let adviceTa = "விவசாய ட்ரோன் மற்றும் பூம் தெளிப்புக்கு மிகச்சிறந்த நேரம். மருந்து காற்றில் வீணாகாது.";

  if (!windOk) {
    adviceEn = "High wind speed detected. High risk of chemical drift; drone spraying not recommended right now.";
    adviceTa = "அதிக காற்று வேகம். மருந்து காற்றில் அடித்துச் செல்லப்படலாம்; தற்போது ட்ரோன் தெளிக்க வேண்டாம்.";
  } else if (!rainOk) {
    adviceEn = "Rain probability elevated. Chemical wash-off risk high.";
    adviceTa = "மழை பெய்ய வாய்ப்புள்ளது. மருந்து தண்ணீரில் அடித்துச் செல்லப்படலாம்.";
  }

  return {
    suitable,
    score: suitable ? 92 : 45,
    adviceEn,
    adviceTa,
  };
}

// -------------------------------------------------------------
// AI Chatbot Assistant Engine (English & Tamil)
// -------------------------------------------------------------
function handleAiChat(message: string, lang = "en") {
  const q = message.toLowerCase();
  const isTa = lang === "ta" || /[\u0B80-\u0BFF]/.test(message);

  if (q.includes("drone") || q.includes("ட்ரோன்") || q.includes("spray") || q.includes("மருந்து")) {
    return {
      reply: isTa
        ? "டிஜேஐ அக்ராஸ் T40 (DJI Agras T40) மற்றும் கருடா கிசான் ட்ரோன்கள் கிடைக்கின்றன. ஒரு ஏக்கருக்கு வெறும் 6 நிமிடங்களில் 90% தண்ணீர் சேமிப்புடன் மருந்து தெளிக்கலாம். வாடகை ₹2,800/நாள் (உரிமம் பெற்ற பைலட்டுடன்)."
        : "We recommend the DJI Agras T40 (40L) or Garuda Kisan (16L) drones. They cover 1 acre in just 6 minutes with 90% water savings. Rental rate is ₹2,800/day including DGCA-certified pilot.",
      recommendedEquipmentId: "eq-drone-1",
      quickPills: isTa ? ["ட்ரோன் முன்பதிவு செய்", "டிராக்டர் வாடகை", "லேசர் சமன்"] : ["Book Drone", "Compare Tractors", "Land Leveler"],
    };
  }

  if (q.includes("tractor") || q.includes("டிராக்டர்") || q.includes("plough") || q.includes("உழவு")) {
    return {
      reply: isTa
        ? "நில உழவிற்கு ஜான் டீர் 5310 (55 HP 4WD) அல்லது மகிந்திரா யுவோ 575 DI (47 HP) டிராக்டர்கள் மிகவும் ஏற்றவை. ரோட்டாவேட்டர், கொழு மற்றும் டிரைலருடன் இணைக்கலாம். தினசரி வாடகை ₹1,650 - ₹1,800."
        : "For heavy tillage, the John Deere 5310 4WD (55 HP) and Mahindra Yuvo Tech+ 575 DI (47 HP) are top rated. Compatible with rotavators, disc ploughs and trailers. Rates start from ₹1,650/day.",
      recommendedEquipmentId: "eq-tractor-1",
      quickPills: isTa ? ["ஜான் டீர் 5310", "மகிந்திரா யுவோ", "ரோட்டாவேட்டர்"] : ["John Deere 5310", "Mahindra Yuvo", "Rotavator"],
    };
  }

  if (q.includes("harvester") || q.includes("அறுவடை") || q.includes("நெல்") || q.includes("paddy")) {
    return {
      reply: isTa
        ? "நெல் அறுவடைக்கு கிளாஸ் க்ராப் டைகர் 30 மற்றும் குபோடா DC-68G அறுவடை இயந்திரங்கள் தயாராக உள்ளன. ஈர நிலங்களிலும் சக்கரம் புதையாமல் அறுவடை செய்யும் ட்ராக் அமைப்பும் உள்ளது."
        : "For paddy & wheat harvest, the Claas Crop Tiger 30 and Kubota DC-68G Harvesters are available. They feature rubber caterpillar crawlers that operate smoothly even in saturated wetland soils.",
      recommendedEquipmentId: "eq-harvester-1",
      quickPills: isTa ? ["அறுவடை இயந்திரங்கள்", "வைக்கோல் பேலர்", "தானிய விதானம்"] : ["View Harvesters", "Straw Baler", "Grain Seeds"],
    };
  }

  if (q.includes("deposit") || q.includes("பாதுகாப்பு") || q.includes("escrow") || q.includes("பணம்")) {
    return {
      reply: isTa
        ? "அக்ரிரென்ட்டில் அக்ரிசேஃப் (AgriSafe™) டிஜிட்டல் எஸ்க்ரோ முறை உள்ளது. நீங்கள் செலுத்தும் பாதுகாப்பு வைப்புத்தொகை (Security Deposit) பாதுகாப்பாக வைக்கப்பட்டு, கருவி சேதமின்றி திரும்பிய 24 மணி நேரத்தில் உங்கள் வங்கிக் கணக்கில் வரவு வைக்கப்படும்."
        : "AgriRent uses AgriSafe™ digital escrow. Your refundable security deposit is securely held during the rental and released back to your bank within 24 hours of zero-damage return inspection.",
      quickPills: isTa ? ["விதிகள் பார்க்க", "கருவிகள் பார்க்க"] : ["Escrow Terms", "View Listings"],
    };
  }

  return {
    reply: isTa
      ? "வணக்கம்! நான் உங்கள் அக்ரிரென்ட் AI விவசாய உதவியாளர். டிராக்டர், அறுவடை இயந்திரம், விவசாய ட்ரோன் அல்லது நில சமன் செய்யும் கருவிகள் பற்றி என்னிடம் கேளுங்கள். உங்கள் நில அளவிற்கு ஏற்ற சரியான கருவியை பரிந்துரைக்கிறேன்!"
      : "Hello! I am your AgriRent AI Farm Assistant. Ask me about tractors, combine harvesters, spraying drones, or water pumps. I can calculate the best machinery for your farm acreage and soil type!",
    quickPills: isTa ? ["பரிந்துரைக்கப்படும் டிராக்டர்", "ட்ரோன் தெளிப்பு விலை", "பாதுகாப்பு வைப்பு"] : ["Recommended Tractors", "Drone Spraying Rates", "Security Deposit Info"],
  };
}

// -------------------------------------------------------------
// Unique Feature: AgriMatch™ Acreage to Machinery Calculator
// -------------------------------------------------------------
function calculateAgriMatch(params: { acres: number; crop: string; soil: string; operation: string }) {
  const acres = Math.max(1, Number(params.acres) || 1);
  const crop = params.crop || "Paddy";
  const soil = params.soil || "Clay Wetland";
  const operation = params.operation || "Tillage";

  let hpRequired = 45;
  let recommendedCategory = "Tractor";
  let recommendedTool = "John Deere 5310 4WD (55 HP) + Shaktiman Rotavator 7ft";
  let recommendedId = "eq-tractor-1";
  let hoursPerAcre = 1.6;
  let dieselPerAcre = 6.5; // liters
  let manualCostPerAcre = 3200;
  let mechanizedCostPerAcre = 1450;

  if (operation.toLowerCase().includes("spray") || crop.toLowerCase().includes("cotton")) {
    recommendedCategory = "Drone & Tech";
    recommendedTool = "DJI Agras T40 Agricultural Spraying Drone";
    recommendedId = "eq-drone-1";
    hoursPerAcre = 0.1; // 6 mins
    dieselPerAcre = 0.8;
    manualCostPerAcre = 900;
    mechanizedCostPerAcre = 450;
  } else if (operation.toLowerCase().includes("harvest")) {
    recommendedCategory = "Harvester";
    recommendedTool = "Claas Crop Tiger 30";
    recommendedId = "eq-harvester-1";
    hoursPerAcre = 0.4;
    dieselPerAcre = 9.5;
    manualCostPerAcre = 4800;
    mechanizedCostPerAcre = 2200;
  } else if (operation.toLowerCase().includes("level") || operation.toLowerCase().includes("plough") || operation.toLowerCase().includes("till")) {
    recommendedCategory = "Ploughing & Tilling";
    recommendedTool = "Mahindra MB Plough";
    recommendedId = "eq-tillage-1";
    hoursPerAcre = 1.2;
    dieselPerAcre = 5.2;
    manualCostPerAcre = 3000;
    mechanizedCostPerAcre = 1600;
  }

  const totalHours = Number((acres * hoursPerAcre).toFixed(1));
  const totalDieselLiters = Math.round(acres * dieselPerAcre);
  const totalManualCost = Math.round(acres * manualCostPerAcre);
  const totalMechanizedCost = Math.round(acres * mechanizedCostPerAcre);
  const netSavings = Math.max(0, totalManualCost - totalMechanizedCost);
  const savingsPercent = Math.round((netSavings / (totalManualCost || 1)) * 100);

  return {
    acres,
    crop,
    soil,
    operation,
    hpRequired,
    recommendedCategory,
    recommendedTool,
    recommendedId,
    totalHours,
    totalDieselLiters,
    totalManualCost,
    totalMechanizedCost,
    netSavings,
    savingsPercent,
  };
}

// -------------------------------------------------------------
// Main API Request Router
// -------------------------------------------------------------
export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) return null;

  // Handle CORS Pre-flight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: jsonHeaders });
  }

  try {
    // 1. Health & DB Status
    if (request.method === "GET" && pathname === "/api/health") {
      return json({
        ok: true,
        service: "AgriRent Enterprise Backend",
        timestamp: new Date().toISOString(),
        version: "2.4.0",
        storageEngine: "Active High-Speed Resilience Engine",
        activeUsers: storage.getUsers().length,
        totalListings: storage.getListings().length,
      });
    }

    if (request.method === "GET" && pathname === "/api/db-status") {
      return json({
        connected: true,
        driver: "File-Backed Persistent Store (.workspace/agrirent-store.json)",
        tables: ["users", "sessions", "listings", "bookings", "escrow_audit"],
        usersCount: storage.getUsers().length,
        listingsCount: storage.getListings().length,
        bookingsCount: storage.getBookings().length,
      });
    }

    // 2. Auth: Seed Users disabled (No demo accounts)
    if (request.method === "GET" && pathname === "/api/auth/seed-users") {
      return json({ seedUsers: [] });
    }

    if (request.method === "POST" && pathname === "/api/auth/email-otp/request") {
      const body = await readBody<{ email?: string; role?: string }>(request);
      const email = body?.email?.toLowerCase().trim();
      if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: "A valid email address is required" }, 400);
      }
      const requestedRole = body?.role;
      if (email === DEMO_OTP_ROLE_EMAIL && !isAuthRole(requestedRole)) {
        return json({ error: "Select a valid role for this demo account." }, 400);
      }
      if (!process.env["RESEND_API_KEY"]?.trim() || !process.env["AUTH_EMAIL_FROM"]?.trim()) {
        return json({ error: "Email OTP sign-in is not configured. Set RESEND_API_KEY and AUTH_EMAIL_FROM on the server." }, 503);
      }

      const now = Date.now();
      cleanupEmailOtpState(now);
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      if (
        !checkEmailOtpRateLimit(`otp-email-cooldown:${email}`, 1, 30_000, now) ||
        !checkEmailOtpRateLimit(`otp-email-window:${email}`, 3, 15 * 60_000, now) ||
        !checkEmailOtpRateLimit(`otp-ip-window:${ip}`, 20, 15 * 60_000, now)
      ) {
        return json({ error: "Too many code requests. Please wait before trying again." }, 429);
      }

      const user = storage.findUserByEmail(email);
      if (user?.status === "active") {
        const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
        const delivered = await sendEmailOtp(email, code);
        if (!delivered) {
          return json({ error: "Could not send the sign-in code. Please try again later." }, 502);
        }
        emailOtps.set(email, {
          hash: hashEmailOtp(email, code),
          expiresAt: now + 5 * 60_000,
          attempts: 0,
          role: email === DEMO_OTP_ROLE_EMAIL && isAuthRole(requestedRole) ? requestedRole : null,
        });
      }
      return json({ success: true });
    }

    if (request.method === "POST" && pathname === "/api/auth/email-otp/verify") {
      const body = await readBody<{ email?: string; code?: string; role?: string }>(request);
      const email = body?.email?.toLowerCase().trim();
      const code = body?.code?.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !code || !/^\d{6}$/.test(code)) {
        return json({ error: "Enter a valid email address and 6-digit code." }, 400);
      }

      const now = Date.now();
      cleanupEmailOtpState(now);
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      if (
        !checkEmailOtpRateLimit(`otp-verify-email:${email}`, 10, 15 * 60_000, now) ||
        !checkEmailOtpRateLimit(`otp-verify-ip:${ip}`, 30, 15 * 60_000, now)
      ) {
        return json({ error: "Too many verification attempts. Please request a new code later." }, 429);
      }

      const pending = emailOtps.get(email);
      if (!pending || pending.expiresAt <= now) {
        emailOtps.delete(email);
        return json({ error: "The code is invalid or expired. Request a new code and try again." }, 401);
      }
      if (email === DEMO_OTP_ROLE_EMAIL && pending.role !== body?.role) {
        return json({ error: "The selected role must match the role used when requesting this code." }, 400);
      }
      const submittedHash = hashEmailOtp(email, code);
      if (!timingSafeEqual(pending.hash, submittedHash)) {
        pending.attempts += 1;
        if (pending.attempts >= 5) emailOtps.delete(email);
        return json({ error: "The code is invalid or expired. Request a new code and try again." }, 401);
      }

      emailOtps.delete(email);
      const user = storage.findUserByEmail(email);
      if (!user || user.status !== "active") {
        return json({ error: "The code is invalid or expired. Request a new code and try again." }, 401);
      }
      const sessionRole = email === DEMO_OTP_ROLE_EMAIL ? pending.role || user.role : user.role;

      const token = signJwt({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: sessionRole,
        provider: user.provider || "local",
      });
      return json(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: sessionRole,
            phone: user.phone,
            location: user.location,
            avatar: user.avatar,
            theme: user.theme,
            provider: user.provider || "local",
            verificationStatus: user.verificationStatus,
          },
        },
        200,
        { "set-cookie": sessionCookie(token, request) }
      );
    }

    if (request.method === "GET" && pathname === "/api/auth/google/start") {
      const config = googleConfiguration();
      if (!config) return googleRedirect(request, "not-configured");

      const state = randomBytes(32).toString("hex");
      const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
      const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authorizationUrl.search = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state,
        prompt: "select_account",
      }).toString();

      return new Response(null, {
        status: 302,
        headers: {
          location: authorizationUrl.toString(),
          "set-cookie": `agrirent_google_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600${secure}`,
        },
      });
    }

    if (request.method === "GET" && pathname === "/api/auth/google/callback") {
      const config = googleConfiguration();
      const stateCookie = cookieValue(request, "agrirent_google_state");
      const state = url.searchParams.get("state");
      const code = url.searchParams.get("code");
      const oauthError = url.searchParams.get("error");
      const clearState = clearCookie("agrirent_google_state", request);
      const clearPending = clearCookie("agrirent_google_pending", request);

      if (!state || !stateCookie || !isEqualSecret(state, stateCookie)) {
        return googleRedirect(request, "failed", [clearState]);
      }
      if (oauthError === "access_denied") {
        return googleRedirect(request, "cancelled", [clearState]);
      }
      if (!config) return googleRedirect(request, "not-configured", [clearState]);
      if (!code) return googleRedirect(request, "failed", [clearState]);

      try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.redirectUri,
            grant_type: "authorization_code",
          }),
        });
        if (!tokenResponse.ok) return googleRedirect(request, "failed", [clearState]);
        const tokens = await tokenResponse.json() as { access_token?: string; token_type?: string };
        if (!tokens.access_token || tokens.token_type?.toLowerCase() !== "bearer") {
          return googleRedirect(request, "failed", [clearState]);
        }

        const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        if (!profileResponse.ok) return googleRedirect(request, "failed", [clearState]);
        const profile = await profileResponse.json() as {
          sub?: string;
          email?: string;
          email_verified?: boolean;
          name?: string;
          picture?: string;
        };
        if (
          !profile.sub ||
          profile.sub.length > 255 ||
          !profile.email ||
          profile.email.length > 254 ||
          !profile.name ||
          profile.name.length > 200 ||
          profile.email_verified !== true ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
        ) {
          return googleRedirect(request, "failed", [clearState]);
        }

        const email = profile.email.toLowerCase();
        const existingByGoogleId = storage.findUserByGoogleId(profile.sub);
        const existingByEmail = storage.findUserByEmail(email);
        let existingUser = existingByGoogleId;
        if (existingUser && existingByEmail && existingByEmail.id !== existingUser.id) {
          return googleRedirect(request, "conflict", [clearState, clearPending]);
        }
        if (!existingUser && existingByEmail) {
          existingUser = storage.linkGoogleIdentity(existingByEmail.id, profile.sub);
          if (!existingUser) {
            return googleRedirect(request, "conflict", [clearState, clearPending]);
          }
        }
        if (existingUser) {
          if (existingUser.status !== "active") {
            return googleRedirect(request, "inactive", [clearState, clearPending]);
          }
          if (googleTestRoleSwitchEnabled()) {
            const pendingToken = signJwt({
              userId: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
              provider: "google",
              purpose: "google-role-switch",
              googleId: profile.sub,
              avatar: existingUser.avatar,
            }, 10 * 60);
            const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
            return googleRedirect(request, "role-switch", [
              clearState,
              clearPending,
              `agrirent_google_pending=${pendingToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600${secure}`,
            ]);
          }
          const token = signJwt({
            userId: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            provider: "google",
          });
          return googleRedirect(request, "success", [
            clearState,
            clearPending,
            sessionCookie(token, request),
          ]);
        }

        const pendingToken = signJwt({
          userId: profile.sub,
          name: profile.name,
          email,
          role: "farmer",
          provider: "google",
          purpose: "google-pending",
          googleId: profile.sub,
          avatar: profile.picture || "",
        }, 10 * 60);
        const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
        return googleRedirect(request, "role", [
          clearState,
          `agrirent_google_pending=${pendingToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600${secure}`,
        ]);
      } catch {
        console.error("Google OAuth callback failed.");
        return googleRedirect(request, "failed", [clearState]);
      }
    }

    if (request.method === "POST" && pathname === "/api/auth/google/complete") {
      const body = await readBody<{ role?: string }>(request);
      const pendingToken = cookieValue(request, "agrirent_google_pending");
      const pending = pendingToken ? verifyJwt(pendingToken) : null;
      if (
        !pending ||
        (pending.purpose !== "google-pending" && pending.purpose !== "google-role-switch") ||
        pending.provider !== "google" ||
        !pending.googleId ||
        !pending.email ||
        !pending.name
      ) {
        return jsonWithCookies(
          { error: "Google sign-in expired. Please start again." },
          401,
          [clearCookie("agrirent_google_pending", request)]
        );
      }

      if (pending.purpose === "google-role-switch") {
        if (!googleTestRoleSwitchEnabled()) {
          return jsonWithCookies(
            { error: "Google test role switching is disabled." },
            403,
            [clearCookie("agrirent_google_pending", request)]
          );
        }
        if (!isAuthRole(body?.role)) {
          return json({ error: "Select Farmer, Equipment Owner, or Admin to continue." }, 400);
        }
        const user = storage.findUserById(pending.userId);
        if (
          !user ||
          user.status !== "active" ||
          user.provider !== "google" ||
          user.googleId !== pending.googleId
        ) {
          return jsonWithCookies(
            { error: "This Google account is no longer linked to the AgriRent account." },
            403,
            [clearCookie("agrirent_google_pending", request)]
          );
        }
        const token = signJwt({
          userId: user.id,
          name: user.name,
          email: user.email,
          role: body.role,
          provider: "google",
        });
        const { passwordHash: _passwordHash, googleId: _googleId, ...safeUser } = user;
        return jsonWithCookies(
          { user: { ...safeUser, role: body.role } },
          200,
          [sessionCookie(token, request), clearCookie("agrirent_google_pending", request)]
        );
      }

      if (pending.purpose !== "google-pending" || (body?.role !== "farmer" && body?.role !== "owner")) {
        return json({ error: "Select Farmer or Equipment Owner to continue." }, 400);
      }

      const existingByGoogleId = storage.findUserByGoogleId(pending.googleId);
      const existingByEmail = storage.findUserByEmail(pending.email);
      let existingUser = existingByGoogleId;
      if (existingUser && existingByEmail && existingByEmail.id !== existingUser.id) {
        return jsonWithCookies(
          { error: "An account with this email already exists. Sign in with that account's existing method." },
          409,
          [clearCookie("agrirent_google_pending", request)]
        );
      }
      if (!existingUser && existingByEmail) {
        existingUser = storage.linkGoogleIdentity(existingByEmail.id, pending.googleId);
        if (!existingUser) {
          return jsonWithCookies(
            { error: "This Google account is already linked to another AgriRent account." },
            409,
            [clearCookie("agrirent_google_pending", request)]
          );
        }
      }
      if (existingUser) {
        if (existingUser.status !== "active") {
          return jsonWithCookies(
            { error: "This AgriRent account is inactive." },
            403,
            [clearCookie("agrirent_google_pending", request)]
          );
        }
        const token = signJwt({
          userId: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          provider: "google",
        });
        const { passwordHash: _passwordHash, googleId: _googleId, ...safeUser } = existingUser;
        return jsonWithCookies(
          { user: safeUser },
          200,
          [sessionCookie(token, request), clearCookie("agrirent_google_pending", request)]
        );
      }

      const user = storage.createUser({
        name: pending.name,
        email: pending.email,
        role: body.role,
        status: "active",
        provider: "google",
        googleId: pending.googleId,
        phone: "",
        location: "Tamil Nadu, India",
        avatar: pending.avatar || "",
        verificationStatus: "NOT_VERIFIED",
      });
      const token = signJwt({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: "google",
      });
      const { passwordHash: _passwordHash, googleId: _googleId, ...safeUser } = user;
      return jsonWithCookies(
        { user: safeUser },
        201,
        [sessionCookie(token, request), clearCookie("agrirent_google_pending", request)]
      );
    }

    // 3. Auth: Real Database Login with Password Verification & Role Authorization
    if (request.method === "POST" && pathname === "/api/auth/login") {
      const body = await readBody<{ email?: string; password?: string; role?: string; remember?: boolean }>(request);
      const email = body?.email?.toLowerCase().trim();
      const password = body?.password;
      const requestedRole = body?.role;

      if (!email || !password) {
        return json({ error: "Email and password are required" }, 400);
      }
      if (!["farmer", "owner", "admin"].includes(requestedRole || "")) {
        return json({ error: "A valid registered role is required" }, 400);
      }

      const user = storage.findUserByEmail(email);
      if (!user) {
        return json({ error: "Account not found with this email" }, 401);
      }

      if (user.status !== "active") {
        return json({ error: "This account has been suspended by the administrator" }, 403);
      }

      if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
        return json({ error: "Incorrect password. Please verify your credentials." }, 401);
      }

      if (!user.passwordHash.startsWith("scrypt$")) {
        storage.updateUserPasswordHash(user.id, hashPassword(password));
      }

      // Role authorization verification:
      // If user selected or requested a specific role, verify they actually have permission for that role in the database!
      if (user.role !== requestedRole) {
        const registeredRole = user.role === "farmer" ? "Farmer" : user.role === "owner" ? "Equipment Owner" : "Administrator";
        return json(
          {
            error: `Access denied for selected role. This account is registered as '${registeredRole}'. Please select your registered role.`,
          },
          403
        );
      }

      const maxAge = body.remember === false ? 8 * 60 * 60 : 30 * 24 * 60 * 60;
      const token = signJwt({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider || "local",
      }, maxAge);

      return json(
        {
          user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location,
          avatar: user.avatar,
          theme: user.theme,
          provider: user.provider || "local",
          verificationStatus: user.verificationStatus,
          },
        },
        200,
        { "set-cookie": sessionCookie(token, request, maxAge) }
      );
    }

    if (request.method === "POST" && pathname === "/api/auth/logout") {
      const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
      return json(
        { success: true },
        200,
        { "set-cookie": `agrirent_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}` }
      );
    }

    // 4. Auth: Real Account Registration (Persisted in DB with Role & Validation)
    if (request.method === "POST" && pathname === "/api/auth/register") {
      const body = await readBody<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        role?: "farmer" | "owner";
        phone?: string;
        location?: string;
      }>(request);

      const name = body?.name?.trim();
      const email = body?.email?.toLowerCase().trim();
      const password = body?.password;
      const role = body?.role;
      const phone = body?.phone?.trim();

      if (!name || name.length < 2) {
        return json({ error: "Full Name is required (minimum 2 characters)" }, 400);
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: "A valid email address is required" }, 400);
      }

      const phoneDigits = phone?.replace(/\D/g, "") || "";
      if (!phone || phoneDigits.length < 10 || phoneDigits.length > 15) {
        return json({ error: "A valid phone number with 10 to 15 digits is required" }, 400);
      }

      if (!password || password.trim().length < 6) {
        return json({ error: "Password must be at least 6 characters long" }, 400);
      }
      if (password !== body?.confirmPassword) {
        return json({ error: "Password confirmation does not match" }, 400);
      }

      if (role !== "farmer" && role !== "owner") {
        return json({ error: "Valid role selection (Farmer or Equipment Owner) is required" }, 400);
      }

      const existingEmail = storage.findUserByEmail(email);
      if (existingEmail) {
        return json({ error: "An account with this email already exists. Please sign in." }, 409);
      }

      const existingPhone = storage.findUserByPhone(phone);
      if (existingPhone) {
        return json({ error: "An account with this phone number already exists." }, 409);
      }

      const newUser = storage.createUser({
        name,
        email,
        passwordHash: hashPassword(password),
        role,
        phone,
        location: body?.location || "Tamil Nadu, India",
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        status: "active",
        provider: "local",
        verificationStatus: "NOT_VERIFIED",
      });

      const token = signJwt({
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        provider: "local",
      });

      return json(
        {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
            location: newUser.location,
            avatar: newUser.avatar,
            theme: newUser.theme,
            provider: "local",
            verificationStatus: newUser.verificationStatus,
          },
        },
        201,
        { "set-cookie": sessionCookie(token, request) }
      );
    }

    // 5. User Theme Persistence API
    if (request.method === "PATCH" && pathname === "/api/users/theme") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) {
        return json({ error: "Authentication required" }, 401);
      }

      const body = await readBody<{ theme?: string }>(request);
      if (!body?.theme) {
        return json({ error: "Theme identifier is required" }, 400);
      }

      const updated = storage.updateUserTheme(jwtUser.userId, body.theme);
      if (!updated) return json({ error: "User not found" }, 404);

      return json({ success: true, theme: updated.theme });
    }

    // 6. Auth: Current User Verification (JWT Protected)
    if (request.method === "GET" && pathname === "/api/auth/me") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) {
        return json({ error: "Missing or invalid JWT token in Authorization header" }, 401);
      }
      const user = storage.findUserById(jwtUser.userId);
      if (!user) {
        return json({ error: "User no longer exists" }, 404);
      }
      const { passwordHash: _, ...safeUser } = user;
      return json({ user: { ...safeUser, role: jwtUser.role }, jwtClaims: jwtUser });
    }

    if (request.method === "PUT" && pathname === "/api/profile/contact") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) return json({ error: "Authentication required" }, 401);

      const body = await readBody<{ email?: string; phone?: string }>(request);
      const email = body?.email?.trim().toLowerCase();
      const phone = typeof body?.phone === "string" ? normalizeIndianMobileNumber(body.phone) : null;
      if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: "Enter a valid email address." }, 400);
      }
      if (!phone) {
        return json({ error: "Enter a valid Indian mobile number, such as +91 98765 43210." }, 400);
      }

      const user = storage.findUserById(jwtUser.userId);
      if (!user) return json({ error: "User no longer exists" }, 404);
      if (email !== user.email.toLowerCase()) {
        const now = Date.now();
        cleanupEmailOtpState(now);
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        if (
          !checkEmailOtpRateLimit(`contact-otp-email:${email}`, 3, 15 * 60_000, now) ||
          !checkEmailOtpRateLimit(`contact-otp-user:${user.id}`, 3, 15 * 60_000, now) ||
          !checkEmailOtpRateLimit(`contact-otp-ip:${ip}`, 20, 15 * 60_000, now)
        ) {
          return json({ error: "Too many verification code requests. Please wait before trying again." }, 429);
        }
        if (storage.findUserByEmail(email)) {
          return json({ error: "An account with this email already exists. Please use a different email address." }, 409);
        }
        const phoneOwner = storage.findUserByPhone(phone);
        if (phoneOwner && phoneOwner.id !== user.id) {
          return json({ error: "This phone number is already used by another account." }, 409);
        }

        const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
        let delivered = false;
        try {
          delivered = await sendEmailOtp(email, code, "change-email");
        } catch {
          console.error("Email change verification delivery failed.");
        }
        if (!delivered) {
          return json({ error: "Could not send a verification code to that email. Contact details were not changed." }, 502);
        }

        contactEmailOtps.set(user.id, {
          email,
          phone,
          hash: hashEmailOtp(email, code),
          expiresAt: now + 5 * 60_000,
          attempts: 0,
        });
        const { passwordHash: _passwordHash, ...safeUser } = user;
        return json({ user: { ...safeUser, role: jwtUser.role }, emailVerificationRequired: true });
      }

      const updateResult = storage.updateUserContact(user.id, user.email.toLowerCase(), phone);
      if ("error" in updateResult) {
        if (updateResult.error === "phone_in_use") {
          return json({ error: "This phone number is already used by another account." }, 409);
        }
        return json({ error: "Could not update contact details." }, updateResult.error === "email_in_use" ? 409 : 404);
      }
      const { passwordHash: _passwordHash, ...safeUser } = updateResult.user;
      return json({ user: { ...safeUser, role: jwtUser.role }, emailVerificationRequired: false });
    }

    if (request.method === "POST" && pathname === "/api/profile/contact/email/verify") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) return json({ error: "Authentication required" }, 401);
      const body = await readBody<{ code?: string }>(request);
      const code = body?.code?.trim();
      if (!code || !/^\d{6}$/.test(code)) {
        return json({ error: "Enter the 6-digit verification code." }, 400);
      }

      const now = Date.now();
      cleanupEmailOtpState(now);
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      if (
        !checkEmailOtpRateLimit(`contact-verify-user:${jwtUser.userId}`, 10, 15 * 60_000, now) ||
        !checkEmailOtpRateLimit(`contact-verify-ip:${ip}`, 30, 15 * 60_000, now)
      ) {
        return json({ error: "Too many verification attempts. Request a new code later." }, 429);
      }

      const pending = contactEmailOtps.get(jwtUser.userId);
      if (!pending || pending.expiresAt <= now) {
        contactEmailOtps.delete(jwtUser.userId);
        return json({ error: "The code is invalid or expired. Request a new code and try again." }, 401);
      }
      const submittedHash = hashEmailOtp(pending.email, code);
      if (!timingSafeEqual(pending.hash, submittedHash)) {
        pending.attempts += 1;
        if (pending.attempts >= 5) contactEmailOtps.delete(jwtUser.userId);
        return json({ error: "The code is invalid or expired. Request a new code and try again." }, 401);
      }

      const user = storage.findUserById(jwtUser.userId);
      if (!user || user.status !== "active") {
        contactEmailOtps.delete(jwtUser.userId);
        return json({ error: "User no longer exists or is inactive." }, 403);
      }
      if (storage.findUserByEmail(pending.email)) {
        contactEmailOtps.delete(jwtUser.userId);
        return json({ error: "An account with this email already exists. Please use a different email address." }, 409);
      }

      const updateResult = storage.updateUserContact(user.id, pending.email, pending.phone);
      if ("error" in updateResult) {
        contactEmailOtps.delete(jwtUser.userId);
        return json({ error: "Could not update the verified email address." }, updateResult.error === "email_in_use" ? 409 : 404);
      }
      contactEmailOtps.delete(jwtUser.userId);

      const token = signJwt({
        userId: updateResult.user.id,
        name: updateResult.user.name,
        email: updateResult.user.email,
        role: jwtUser.role,
        provider: updateResult.user.provider || "local",
      });
      const { passwordHash: _passwordHash, ...safeUser } = updateResult.user;
      return json(
        { user: { ...safeUser, role: jwtUser.role }, emailVerified: true },
        200,
        { "set-cookie": sessionCookie(token, request) }
      );
    }

    if (request.method === "DELETE" && pathname === "/api/profile/contact/email/pending") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) return json({ error: "Authentication required" }, 401);
      contactEmailOtps.delete(jwtUser.userId);
      return json({ success: true });
    }

    // 7. Equipment Listings (Public REST API with filters & ratings)
    if (request.method === "GET" && pathname === "/api/listings") {
      const search = url.searchParams.get("search") || undefined;
      const category = url.searchParams.get("category") || undefined;
      const minPrice = url.searchParams.has("minPrice") ? Number(url.searchParams.get("minPrice")) : undefined;
      const maxPrice = url.searchParams.has("maxPrice") ? Number(url.searchParams.get("maxPrice")) : undefined;
      const minRating = url.searchParams.has("minRating") ? Number(url.searchParams.get("minRating")) : undefined;
      const availability = url.searchParams.get("availability") || undefined; // 'rent' | 'buy' | 'both'
      const sortBy = url.searchParams.get("sortBy") || undefined;

      const filters: { search?: string; category?: string; minPrice?: number; maxPrice?: number } = {};
      if (search) filters.search = search;
      if (category) filters.category = category;
      if (minPrice !== undefined) filters.minPrice = minPrice;
      if (maxPrice !== undefined) filters.maxPrice = maxPrice;

      let items = storage.getListings(filters);
      items = items.map((listing) => {
        const ratingSummary = storage.getEquipmentRatingSummary(listing.id);
        return {
          ...listing,
          rating: ratingSummary.averageRating,
          reviews: ratingSummary.totalReviews,
        };
      });

      if (minRating !== undefined) {
        items = items.filter((l) => l.rating >= minRating);
      }

      if (availability && availability !== "all") {
        if (availability === "rent") {
          items = items.filter((l) => l.availabilityType === "rent" || l.availabilityType === "both" || !l.availabilityType);
        } else if (availability === "buy") {
          items = items.filter((l) => l.availabilityType === "buy" || l.availabilityType === "both" || (l.purchasePrice && l.purchasePrice > 0));
        }
      }

      if (sortBy === "rating") {
        items.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === "reviews") {
        items.sort((a, b) => b.reviews - a.reviews);
      } else if (sortBy === "price_asc") {
        items.sort((a, b) => a.pricePerDay - b.pricePerDay);
      } else if (sortBy === "price_desc") {
        items.sort((a, b) => b.pricePerDay - a.pricePerDay);
      }

      return json({ count: items.length, listings: items });
    }

    // Single Equipment Item with Reviews & Vendor Info
    if (request.method === "GET" && pathname.startsWith("/api/listings/")) {
      const id = pathname.replace("/api/listings/", "").trim();
      const item = storage.findListingById(id);
      if (!item) return json({ error: "Equipment not found" }, 404);

      const ratingSummary = storage.getEquipmentRatingSummary(id);
      const reviews = storage.getReviews(id);
      const vendor = item.vendorId ? storage.findVendorById(item.vendorId) : null;

      return json({
        listing: item,
        ratingSummary,
        reviews,
        vendor,
      });
    }

    // 8. Equipment Reviews System
    if (request.method === "GET" && pathname === "/api/reviews") {
      const equipmentId = url.searchParams.get("equipmentId") || undefined;
      const reviews = storage.getReviews(equipmentId);
      const summary = equipmentId ? storage.getEquipmentRatingSummary(equipmentId) : null;
      return json({ reviews, summary });
    }

    if (request.method === "POST" && pathname === "/api/reviews") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) {
        return json({ error: "Authentication is required to submit an equipment review" }, 401);
      }
      if (jwtUser.role !== "farmer") {
        return json({ error: "Farmer authentication is required to submit an equipment review" }, 403);
      }

      const body = await readBody<{
        equipmentId?: string;
        bookingId?: string;
        rating?: number;
        reviewText?: string;
      }>(request);

      const equipmentId = typeof body?.equipmentId === "string" ? body.equipmentId.trim() : "";
      const bookingId = typeof body?.bookingId === "string" ? body.bookingId.trim() : "";
      const rating = body?.rating;
      const reviewText = typeof body?.reviewText === "string" ? body.reviewText.trim() : "";

      if (
        !equipmentId ||
        !bookingId ||
        typeof rating !== "number" ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5 ||
        (body?.reviewText !== undefined && (typeof body.reviewText !== "string" || body.reviewText.length > 2000))
      ) {
        return json({ error: "equipmentId, bookingId, and an integer star rating (1-5) are required" }, 400);
      }

      const booking = storage.findBookingById(bookingId);
      if (!booking || booking.farmerId !== jwtUser.userId || booking.listingId !== equipmentId) {
        return json({ error: "You can only rate equipment from your own booking." }, 403);
      }
      if (booking.status !== "completed") {
        return json({ error: "You can rate equipment after the booking is completed." }, 403);
      }
      if (storage.getReviewForBooking(bookingId)) {
        return json({ error: "This booking has already been rated." }, 409);
      }

      const result = storage.createReview({
        equipmentId,
        bookingId,
        userId: jwtUser.userId,
        userName: jwtUser.name,
        rating,
        reviewText,
      });

      if (!result.success) {
        const status = result.error?.includes("already submitted") ? 409 : 400;
        return json({ error: result.error || "Could not submit review" }, status);
      }

      const summary = storage.getEquipmentRatingSummary(equipmentId);

      // Create notification for equipment owner
      const listing = storage.findListingById(equipmentId);
      const listingOwner = listing ? storage.findUserById(listing.ownerId) : null;
      if (listing && listingOwner?.role === "owner" && listingOwner.status === "active") {
        storage.createNotification({
          userId: listing.ownerId,
          title: `New Review for ${listing.name}`,
          message: `${jwtUser.name} rated ${listing.name} ${rating} stars${reviewText ? `: "${reviewText}"` : "."}`,
          type: "review_received",
          read: false,
          relatedId: listing.id,
        });
      }

      return json({ success: true, review: result.review, summary }, 201);
    }

    // 9. Nearby Vendors for Equipment Purchase
    if (request.method === "GET" && pathname === "/api/vendors") {
      const city = url.searchParams.get("city") || undefined;
      const search = url.searchParams.get("search") || undefined;
      const lat = url.searchParams.has("lat") ? Number(url.searchParams.get("lat")) : undefined;
      const lng = url.searchParams.has("lng") ? Number(url.searchParams.get("lng")) : undefined;
      const sortBy = (url.searchParams.get("sortBy") as "distance" | "rating") || "distance";

      const vendorFilters = {
        ...(city !== undefined ? { city } : {}),
        ...(search !== undefined ? { search } : {}),
        ...(lat !== undefined ? { lat } : {}),
        ...(lng !== undefined ? { lng } : {}),
        sortBy,
      }

      const vendors = storage.getVendors(vendorFilters);
      return json({ count: vendors.length, vendors });
    }

    if (request.method === "GET" && pathname.startsWith("/api/vendors/")) {
      const id = pathname.replace("/api/vendors/", "").trim();
      const vendor = storage.findVendorById(id);
      if (!vendor) return json({ error: "Vendor not found" }, 404);
      return json({ vendor });
    }

    // Create Equipment (Owner / Admin JWT Required)
    if (request.method === "POST" && pathname === "/api/listings") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser || jwtUser.role !== "owner") {
        return json({ error: "Equipment owner authorization required" }, 403);
      }

      const body = await readBody<Partial<StoredListing>>(request);
      if (!body?.name || !body?.category || !body?.pricePerDay) {
        return json({ error: "Name, category, and pricePerDay are mandatory" }, 400);
      }

      const idempotencyKey = getIdempotencyKey(request);
      if (idempotencyKey) {
        const replay = storage.findRequestReplay(jwtUser.userId, "equipment-registration", idempotencyKey);
        if (replay) return json(replay.response);
      }

      const created = storage.createListing({
        ownerId: jwtUser.userId,
        name: body.name,
        nameTa: body.nameTa || body.name,
        category: body.category,
        brand: body.brand || body.name.split(" ")[0] || "Custom",
        model: body.model || body.name,
        imageUrl: body.imageUrl || body.img || "/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg",
        description: body.description || "",
        location: body.location || "Tamil Nadu",
        pricePerDay: Number(body.pricePerDay),
        pricePerHour: body.pricePerHour !== undefined ? Number(body.pricePerHour) : undefined,
        condition: body.condition || "Excellent",
        year: body.year || "2025",
        minRentalDays: body.minRentalDays !== undefined ? Number(body.minRentalDays) : 1,
        deliveryAvailable: body.deliveryAvailable !== undefined ? Boolean(body.deliveryAvailable) : false,
        deliveryCharge: body.deliveryCharge !== undefined ? Number(body.deliveryCharge) : 0,
        available: true,
        img: body.img || body.imageUrl || "/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg",
        rating: 5.0,
        reviews: 0,
        hp: body.hp,
        fuelType: body.fuelType || "Diesel",
        securityDeposit: Number(body.securityDeposit || 2000),
        operatorIncluded: Boolean(body.operatorIncluded),
        specs: body.specs || [],
        ...(body.lat !== undefined ? { lat: body.lat } : {}),
        ...(body.lng !== undefined ? { lng: body.lng } : {}),
      });

      if (idempotencyKey) {
        storage.beginRequestReplay(jwtUser.userId, "equipment-registration", idempotencyKey, {
          listing: created,
          sms: { status: "pending" },
        });
      }

      storage.createNotification({
        userId: jwtUser.userId,
        title: "Equipment Listed Successfully",
        message: `Your ${created.name} is now published and visible to farmers on the AgriRent marketplace.`,
        type: "equipment_added",
        read: false,
        relatedId: created.id,
      });

      let sms: Awaited<ReturnType<typeof sendEquipmentRegistrationSms>>;
      const registeringUser = storage.findUserById(jwtUser.userId);
      try {
        sms = await sendEquipmentRegistrationSms(registeringUser?.phone || "", created.name, created.id);
      } catch {
        console.warn(`Equipment registration SMS failed for ${created.id}: provider request failed unexpectedly.`);
        sms = { status: "failed", maskedPhone: "******", reason: "SMS provider request failed." };
      }

      const responseBody = {
        listing: created,
        sms: sms.status === "no_phone"
          ? { status: sms.status }
          : { status: sms.status, maskedPhone: sms.maskedPhone },
      };
      if (idempotencyKey) {
        storage.completeRequestReplay(jwtUser.userId, "equipment-registration", idempotencyKey, responseBody);
      }
      return json(responseBody, 201);
    }

    // Update Equipment (Owner / Admin JWT Required)
    if (request.method === "PUT" && pathname.startsWith("/api/listings/")) {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser || jwtUser.role !== "owner") {
        return json({ error: "Equipment owner authorization required" }, 403);
      }

      const id = pathname.replace("/api/listings/", "").trim();
      const existing = storage.findListingById(id);
      if (!existing) {
        return json({ error: "Equipment listing not found" }, 404);
      }

      if (existing.ownerId !== jwtUser.userId) {
        return json({ error: "You can only edit your own equipment listings" }, 403);
      }

      const body = await readBody<Partial<StoredListing>>(request);
      if (!body) {
        return json({ error: "Request body required" }, 400);
      }

      const updates: Partial<StoredListing> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.nameTa !== undefined) updates.nameTa = body.nameTa;
      if (body.category !== undefined) updates.category = body.category;
      if (body.brand !== undefined) updates.brand = body.brand;
      if (body.model !== undefined) updates.model = body.model;
      if (body.description !== undefined) updates.description = body.description;
      if (body.location !== undefined) updates.location = body.location;
      if (body.pricePerDay !== undefined) updates.pricePerDay = Number(body.pricePerDay);
      if (body.pricePerHour !== undefined) updates.pricePerHour = Number(body.pricePerHour);
      if (body.securityDeposit !== undefined) updates.securityDeposit = Number(body.securityDeposit);
      if (body.condition !== undefined) updates.condition = body.condition;
      if (body.year !== undefined) updates.year = body.year;
      if (body.minRentalDays !== undefined) updates.minRentalDays = Number(body.minRentalDays);
      if (body.deliveryAvailable !== undefined) updates.deliveryAvailable = Boolean(body.deliveryAvailable);
      if (body.deliveryCharge !== undefined) updates.deliveryCharge = Number(body.deliveryCharge);
      if (body.available !== undefined) updates.available = Boolean(body.available);
      if (body.img !== undefined) {
        updates.img = body.img;
        updates.imageUrl = body.img;
      }
      if (body.hp !== undefined) updates.hp = body.hp;
      if (body.fuelType !== undefined) updates.fuelType = body.fuelType;
      if (body.operatorIncluded !== undefined) updates.operatorIncluded = Boolean(body.operatorIncluded);
      if (body.specs !== undefined) updates.specs = body.specs;
      if (body.lat !== undefined) updates.lat = body.lat;
      if (body.lng !== undefined) updates.lng = body.lng;

      const updated = storage.updateListing(id, updates);
      if (!updated) {
        return json({ error: "Failed to update listing" }, 500);
      }

      storage.createNotification({
        userId: jwtUser.userId,
        title: "Equipment Listing Updated",
        message: `Your listing "${updated.name}" has been updated successfully.`,
        type: "equipment_updated",
        read: false,
        relatedId: updated.id,
      });

      return json({ listing: updated });
    }

    // Delete Equipment (Owner / Admin JWT Required + Booking Safety)
    if (request.method === "DELETE" && pathname.startsWith("/api/listings/")) {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser || jwtUser.role !== "owner") {
        return json({ error: "Equipment owner authorization required" }, 403);
      }

      const id = pathname.replace("/api/listings/", "").trim();
      const existing = storage.findListingById(id);
      if (!existing) {
        return json({ error: "Equipment listing not found" }, 404);
      }

      if (existing.ownerId !== jwtUser.userId) {
        return json({ error: "You can only delete your own equipment listings" }, 403);
      }

      const res = storage.deleteListing(id);
      if (!res.success) {
        return json({ error: res.error || "Cannot delete listing" }, 400);
      }

      storage.createNotification({
        userId: jwtUser.userId,
        title: "Equipment Listing Removed",
        message: `Your listing "${existing.name}" has been removed from the catalog.`,
        type: "equipment_deleted",
        read: false,
      });

      return json({ success: true, message: "Equipment removed successfully" });
    }

    // 8. Bookings (Create & List)
    if (request.method === "GET" && pathname === "/api/bookings") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) {
        return json({ error: "JWT Authentication required" }, 401);
      }

      const filter = jwtUser.role === "admin" ? undefined : jwtUser.role === "farmer" ? { farmerId: jwtUser.userId } : { ownerId: jwtUser.userId };
      const bookings = storage.getBookings(filter);
      const bookingsWithReviews = jwtUser.role === "farmer"
        ? bookings.map((booking) => ({ ...booking, review: storage.getReviewForBooking(booking.id) }))
        : bookings;
      return json({ count: bookings.length, bookings: bookingsWithReviews });
    }

    if (request.method === "POST" && pathname === "/api/bookings") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser || jwtUser.role !== "farmer") {
        return json({ error: "Farmer authorization required to book equipment" }, 403);
      }

      const body = await readBody<{ listingId?: string; startDate?: string; endDate?: string; days?: number }>(request);
      if (!body?.listingId || !body?.startDate || !body?.endDate) {
        return json({ error: "listingId, startDate, and endDate are required" }, 400);
      }

      const idempotencyKey = getIdempotencyKey(request);
      if (idempotencyKey) {
        const replay = storage.findRequestReplay(jwtUser.userId, "booking", idempotencyKey);
        if (replay) return json(replay.response);
      }

      const listing = storage.findListingById(body.listingId);
      if (!listing) {
        return json({ error: "Listing not found" }, 404);
      }

      const days = Math.max(1, body.days || 1);
      const totalAmount = days * listing.pricePerDay;
      const owner = storage.findUserById(listing.ownerId);

      const booking = storage.createBooking({
        listingId: listing.id,
        equipmentName: listing.name,
        equipmentImg: listing.img,
        farmerId: jwtUser.userId,
        farmerName: jwtUser.name,
        ownerId: listing.ownerId,
        ownerName: owner?.name || "Verified Fleet Owner",
        startDate: body.startDate,
        endDate: body.endDate,
        days,
        dailyRate: listing.pricePerDay,
        totalAmount,
        securityDeposit: listing.securityDeposit || 2000,
        escrowStatus: "held",
        status: "active",
      });

      if (idempotencyKey) {
        storage.beginRequestReplay(jwtUser.userId, "booking", idempotencyKey, {
          booking,
          invoiceEmailSent: false,
          sms: { status: "pending" },
        });
      }

      // Notification for Farmer
      storage.createNotification({
        userId: jwtUser.userId,
        title: `Booking Confirmed: ${listing.name}`,
        message: `Your booking ${booking.id} (${days} days, ₹${totalAmount.toLocaleString()}) has been placed. Equipment will arrive on ${body.startDate}.`,
        type: "booking_confirmed",
        read: false,
        relatedId: booking.id,
      });

      if (owner?.role === "owner" && owner.status === "active") {
        storage.createNotification({
          userId: owner.id,
          title: `New Booking Received: ${listing.name}`,
          message: `Farmer ${jwtUser.name} booked ${listing.name} from ${body.startDate} to ${body.endDate}. ₹${totalAmount.toLocaleString()} held in escrow.`,
          type: "booking_received",
          read: false,
          relatedId: booking.id,
        });
      }

      let invoiceEmailSent = false;
      const farmer = storage.findUserById(booking.farmerId);
      try {
        if (!farmer?.email) {
          console.warn(`Booking invoice email not sent for ${booking.id}: farmer email is unavailable.`);
        } else {
          const invoicePdf = createBookingInvoicePdf(booking, farmer.email, listing.category, owner?.email || "");
          invoiceEmailSent = await sendBookingInvoiceEmail(farmer.email, booking, invoicePdf);
        }
      } catch (error) {
        console.error(`Booking invoice email failed for ${booking.id}:`, error);
      }

      const sms = await sendSmsForEvent(
        `booking-created:${booking.id}`,
        "Booking confirmation",
        () => sendBookingConfirmationSms(storage.findUserById(booking.farmerId)?.phone || "", booking)
      );
      const responseBody = {
        booking,
        invoiceEmailSent,
        ...(sms
          ? {
              sms: sms.status === "no_phone"
                ? { status: sms.status }
                : { status: sms.status, maskedPhone: sms.maskedPhone },
            }
          : {}),
      };
      if (idempotencyKey) {
        storage.completeRequestReplay(jwtUser.userId, "booking", idempotencyKey, responseBody);
      }
      return json(responseBody, 201);
    }

    if (request.method === "PATCH" && pathname.startsWith("/api/admin/bookings/") && pathname.endsWith("/complete")) {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) {
        return json({ error: "Authentication is required to complete a booking" }, 401);
      }
      if (jwtUser.role !== "admin") {
        return json({ error: "Administrator authorization required" }, 403);
      }

      const bookingId = pathname.slice("/api/admin/bookings/".length, -"/complete".length);
      if (!bookingId || bookingId.includes("/")) {
        return json({ error: "A valid booking ID is required" }, 400);
      }
      const booking = storage.findBookingById(bookingId);
      if (!booking) {
        return json({ error: "Booking not found" }, 404);
      }
      if (booking.status !== "active" && booking.status !== "delivered") {
        return json({ error: "Only active or delivered bookings can be completed" }, 400);
      }
      const today = new Date().toISOString().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.endDate) || booking.endDate >= today) {
        return json({ error: "A booking can be completed only after its end date" }, 400);
      }

      const completedBooking = storage.updateBookingStatus(bookingId, "completed");
      if (!completedBooking) {
        return json({ error: "Booking not found" }, 404);
      }
      return json({ booking: completedBooking });
    }

    // Update Booking Status (Authenticated & Authorized)
    if (request.method === "PATCH" && pathname.startsWith("/api/bookings/")) {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) {
        return json({ error: "Authentication required to update booking status" }, 401);
      }

      const bookingId = pathname.replace("/api/bookings/", "").replace("/status", "");
      if (pathname.endsWith("/extend")) {
        const bookingIdForExtension = pathname.slice("/api/bookings/".length, -"/extend".length);
        const booking = storage.findBookingById(bookingIdForExtension);
        if (!booking) return json({ error: "Booking not found" }, 404);
        if (jwtUser.role !== "farmer" || booking.farmerId !== jwtUser.userId) {
          return json({ error: "Only the farmer who made this booking can extend it" }, 403);
        }

        const body = await readBody<{ endDate?: string }>(request);
        if (!body?.endDate || !isValidIsoDate(body.endDate)) {
          return json({ error: "A valid endDate in YYYY-MM-DD format is required" }, 400);
        }
        const idempotencyKey = getIdempotencyKey(request);
        if (idempotencyKey) {
          const replay = storage.findRequestReplay(jwtUser.userId, "booking-extension", idempotencyKey);
          if (replay) return json(replay.response);
        }

        const updatedBooking = storage.extendBooking(bookingIdForExtension, body.endDate);
        if (!updatedBooking) {
          return json({ error: "Only active bookings can be extended to a date after the current end date" }, 400);
        }
        if (idempotencyKey) {
          storage.beginRequestReplay(jwtUser.userId, "booking-extension", idempotencyKey, {
            booking: updatedBooking,
            sms: { status: "pending" },
          });
        }

        let sms: Awaited<ReturnType<typeof sendBookingExtensionSms>>;
        const farmer = storage.findUserById(updatedBooking.farmerId);
        try {
          sms = await sendBookingExtensionSms(farmer?.phone || "", updatedBooking);
        } catch {
          console.warn(`Booking extension SMS failed for ${updatedBooking.id}: provider request failed unexpectedly.`);
          sms = { status: "failed", maskedPhone: "******", reason: "SMS provider request failed." };
        }
        const responseBody = {
          booking: updatedBooking,
          sms: sms.status === "no_phone"
            ? { status: sms.status }
            : { status: sms.status, maskedPhone: sms.maskedPhone },
        };
        if (idempotencyKey) {
          storage.completeRequestReplay(jwtUser.userId, "booking-extension", idempotencyKey, responseBody);
        }
        return json(responseBody);
      }
      const existingBooking = storage.findBookingById(bookingId);
      if (!existingBooking) {
        return json({ error: "Booking not found" }, 404);
      }

      const isFarmer = jwtUser.role === "farmer" && existingBooking.farmerId === jwtUser.userId;
      const isOwner = jwtUser.role === "owner" && existingBooking.ownerId === jwtUser.userId;
      const isAdmin = jwtUser.role === "admin";

      if (!isFarmer && !isOwner && !isAdmin) {
        return json({ error: "Not authorized to update this booking" }, 403);
      }

      const body = await readBody<{ status: StoredBooking["status"]; escrowStatus?: StoredBooking["escrowStatus"] }>(request);
      if (!body?.status) {
        return json({ error: "status is required" }, 400);
      }

      if (isFarmer && !isAdmin && body.status !== "cancelled") {
        return json({ error: "Farmers can only cancel their bookings" }, 403);
      }

      const previousStatus = existingBooking.status;
      const updated = storage.updateBookingStatus(bookingId, body.status, body.escrowStatus);
      if (!updated) return json({ error: "Booking not found" }, 404);

      if (body.status === "cancelled") {
        storage.createNotification({
          userId: updated.farmerId,
          title: `Booking Cancelled: ${updated.equipmentName}`,
          message: `Booking ${updated.id} has been cancelled. Refund has been initiated.`,
          type: "booking_cancelled",
          read: false,
          relatedId: updated.id,
        });
        storage.createNotification({
          userId: updated.ownerId,
          title: `Booking Cancelled: ${updated.equipmentName}`,
          message: `Booking ${updated.id} was cancelled by the renter. Equipment is now available again.`,
          type: "booking_cancelled",
          read: false,
          relatedId: updated.id,
        });
      }

      const isDecision = (body.status === "approved" || body.status === "rejected") &&
        previousStatus !== body.status;
      if (isDecision) {
        const sms = await sendSmsForEvent(
          `booking-${body.status}:${updated.id}`,
          `Booking ${body.status}`,
          () => sendBookingDecisionSms(
            storage.findUserById(updated.farmerId)?.phone || "",
            updated,
            body.status === "approved" ? "approved" : "rejected"
          )
        );
        return json({
          booking: updated,
          ...(sms
            ? {
                sms: sms.status === "no_phone"
                  ? { status: sms.status }
                  : { status: sms.status, maskedPhone: sms.maskedPhone },
              }
            : {}),
        });
      }

      return json({ booking: updated });
    }

    // 9. Notifications Center API (Scoped per user)
    if (request.method === "GET" && pathname === "/api/notifications") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) {
        return json({ error: "Authentication required" }, 401);
      }
      const targetUserId = jwtUser.role === "admin" ? (url.searchParams.get("userId") || jwtUser.userId) : jwtUser.userId;
      const notifs = storage.getNotifications(targetUserId);
      return json({ count: notifs.length, notifications: notifs });
    }

    if (request.method === "PATCH" && pathname.startsWith("/api/notifications/") && pathname.endsWith("/read")) {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) {
        return json({ error: "Authentication required" }, 401);
      }
      const notifId = pathname.replace("/api/notifications/", "").replace("/read", "");
      const updated = storage.markNotificationRead(notifId, jwtUser.userId, jwtUser.role === "admin");
      if (!updated) return json({ error: "Notification not found" }, 404);
      return json({ notification: updated });
    }

    if (request.method === "POST" && pathname === "/api/notifications/mark-all-read") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) {
        return json({ error: "Authentication required" }, 401);
      }
      const targetUserId = jwtUser.role === "admin" ? (url.searchParams.get("userId") || jwtUser.userId) : jwtUser.userId;
      storage.markAllNotificationsRead(targetUserId);
      return json({ ok: true, message: "All notifications marked as read" });
    }

    // 10. User Identity Verification API
    if (request.method === "POST" && pathname.startsWith("/api/users/") && pathname.endsWith("/verification")) {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser) {
        return json({ error: "Authentication required" }, 401);
      }
      const userId = pathname.replace("/api/users/", "").replace("/verification", "");
      if (jwtUser.role !== "admin" && jwtUser.userId !== userId) {
        return json({ error: "Not authorized to modify verification status for other users" }, 403);
      }
      const body = await readBody<{ status: "NOT_VERIFIED" | "PENDING" | "VERIFIED" | "REJECTED" }>(request);
      if (!body?.status) {
        return json({ error: "status is required" }, 400);
      }
      if (jwtUser.role !== "admin" && body.status !== "PENDING") {
        return json({ error: "Only administrators can approve or reject verification" }, 403);
      }
      const user = storage.updateUserVerification(userId, body.status);
      if (!user) return json({ error: "User not found" }, 404);

      storage.createNotification({
        userId,
        title: "Verification Status Updated",
        message: `Your identity verification status has been set to: ${body.status}.`,
        type: "verification_status",
        read: false,
      });

      const { passwordHash: _passwordHash, ...safeUser } = user;
      return json({ user: safeUser, verificationStatus: user.verificationStatus });
    }

    // 11. Admin Dashboard Metrics & Management (Admin Authorization Strictly Required)
    if (request.method === "GET" && pathname === "/api/admin/metrics") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser || jwtUser.role !== "admin") {
        return json({ error: "Administrator authorization required" }, 403);
      }
      const metrics = storage.getMetrics();
      return json({ metrics, userRole: jwtUser.role });
    }

    if (request.method === "GET" && pathname === "/api/admin/users") {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser || jwtUser.role !== "admin") {
        return json({ error: "Administrator authorization required" }, 403);
      }
      const users = storage.getUsers().map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        location: u.location,
        status: u.status,
        provider: u.provider || "local",
        createdAt: u.createdAt,
      }));
      return json({ users });
    }

    if (request.method === "POST" && pathname.startsWith("/api/admin/users/") && pathname.endsWith("/toggle")) {
      const jwtUser = getJwtFromHeader(request);
      if (!jwtUser || jwtUser.role !== "admin") {
        return json({ error: "Administrator authorization required" }, 403);
      }
      const userId = pathname.replace("/api/admin/users/", "").replace("/toggle", "");
      const updated = storage.toggleUserStatus(userId);
      if (!updated) return json({ error: "User not found" }, 404);
      const { passwordHash: _passwordHash, ...safeUser } = updated;
      return json({ user: safeUser });
    }

    // 10. Live Agricultural Weather API
    if (request.method === "GET" && pathname === "/api/weather") {
      const location = url.searchParams.get("location") || "Coimbatore";
      const weather = WEATHER_DATABASE[location] || WEATHER_DATABASE['Coimbatore'] || { temp: 29, humidity: 62, windSpeed: 8, rainProb: 10, condition: "Partly Cloudy", conditionTa: "பகுதி மேகமூட்டம்" };
      const spraySuitability = calculateSpraySuitability(weather);

      return json({
        location,
        state: "Tamil Nadu",
        currentWeather: weather,
        spraySuitability,
        timestamp: new Date().toISOString(),
      });
    }

    // 11. AI Farmer Assistant Chatbot API
    if (request.method === "POST" && pathname === "/api/ai-chat") {
      const body = await readBody<{ message?: string; lang?: string }>(request);
      const message = body?.message || "";
      const lang = body?.lang || "en";
      const response = handleAiChat(message, lang);
      return json(response);
    }

    // 12. Unique Feature: AgriMatch™ Acreage & Machinery Optimizer
    if (request.method === "POST" && pathname === "/api/calculator/agrimatch") {
      const body = await readBody<{ acres?: number; crop?: string; soil?: string; operation?: string }>(request);
      const result = calculateAgriMatch({
        acres: Number(body?.acres || 5),
        crop: body?.crop || "Paddy",
        soil: body?.soil || "Clay Wetland",
        operation: body?.operation || "Tillage",
      });
      return json(result);
    }

    // 13. Contact Us Form API
    if (request.method === "POST" && pathname === "/api/contact") {
      const body = await readBody<{
        fullName?: string;
        email?: string;
        phone?: string;
        subject?: string;
        category?: string;
        message?: string;
      }>(request);

      const fullName = body?.fullName?.trim();
      const email = body?.email?.trim();
      const phone = body?.phone?.trim();
      const subject = body?.subject?.trim();
      const category = body?.category?.trim();
      const message = body?.message?.trim();

      if (!fullName) {
        return json({ error: "Full Name is required" }, 400);
      }
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return json({ error: "A valid email address is required" }, 400);
      }
      const rawPhone = (phone || "").replace(/\D/g, "");
      if (!phone || rawPhone.length < 10) {
        return json({ error: "A valid phone number with at least 10 digits is required" }, 400);
      }
      if (!subject) {
        return json({ error: "Subject is required" }, 400);
      }
      if (!category) {
        return json({ error: "Support Category is required" }, 400);
      }
      if (!message || message.length < 15) {
        return json({ error: "Message must be at least 15 characters long" }, 400);
      }

      const created = storage.createContactMessage({
        fullName,
        email,
        phone,
        subject,
        category,
        message,
      });

      const admin = storage.getUsers().find((user) => user.role === "admin" && user.status === "active");
      if (admin) {
        storage.createNotification({
          userId: admin.id,
          title: `Contact Inquiry: ${created.category}`,
          message: `${created.fullName} (${created.phone}) sent inquiry: "${created.subject}"`,
          type: "contact_received",
          read: false,
        });
      }

      return json({
        success: true,
        message: "Thank you for contacting AgriRent. Our founder and support team will respond shortly.",
        contact: created,
      }, 201);
    }

    if (request.method === "GET" && pathname === "/api/contact") {
      const messages = storage.getContactMessages();
      return json({ count: messages.length, messages });
    }

    return json({ error: `API route not found: ${request.method} ${pathname}` }, 404);
  } catch (error) {
    console.error("API Router Error:", error);
    return json({ error: "Internal server error occurred", details: String(error) }, 500);
  }
}
