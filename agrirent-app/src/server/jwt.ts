import { createHmac, randomBytes } from "node:crypto";

const JWT_SECRET = process.env["JWT_SECRET"] || randomBytes(32);

export interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: "farmer" | "owner" | "admin";
  provider?: "local" | "google";
  purpose?: "google-pending";
  googleId?: string;
  avatar?: string;
  iat?: number;
  exp?: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

export function signJwt(payload: JwtPayload, expiresInSeconds = 30 * 24 * 60 * 60): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const encodedHeader = parts[0];
    const encodedPayload = parts[1];
    const signature = parts[2];
    if (!encodedHeader || !encodedPayload || !signature) return null;

    const expectedSignature = createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

export function decodeJwt(token: string): { header: unknown; payload: JwtPayload | null } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { header: null, payload: null };
    const p0 = parts[0];
    const p1 = parts[1];
    if (!p0 || !p1) return { header: null, payload: null };
    const header = JSON.parse(base64UrlDecode(p0));
    const payload = JSON.parse(base64UrlDecode(p1)) as JwtPayload;
    return { header, payload };
  } catch {
    return { header: null, payload: null };
  }
}
