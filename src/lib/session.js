import { createHmac, timingSafeEqual } from "node:crypto";

// Admin session cookie: "<expiry ms>.<HMAC of the expiry>", signed with ADMIN_SESSION_SECRET.
// No Next.js request helpers here, so both src/lib/auth.js (pages, actions) and src/proxy.js
// (the request proxy) can verify a cookie value.
export const ADMIN_COOKIE = "cinarli_admin";
export const SESSION_DAYS = 7;

const secret = () => process.env.ADMIN_SESSION_SECRET;

export const isAuthConfigured = () =>
  Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && secret());

export const sign = (value) => createHmac("sha256", secret()).update(value).digest("base64url");

export function safeEqual(a, b) {
  // Hashing first gives equal lengths, so the comparison never leaks the length either.
  const hash = (text) => createHmac("sha256", "compare").update(String(text)).digest();
  return timingSafeEqual(hash(a), hash(b));
}

/** True when `value` is an unexpired cookie signed with the current secret. */
export function verifySession(value, now = Date.now()) {
  if (!isAuthConfigured() || !value) return false;
  const [expires, signature] = String(value).split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < now) return false;
  return safeEqual(signature, sign(expires));
}

/** A fresh cookie value and its expiry date. */
export function createSession(now = Date.now()) {
  const expires = now + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return { value: `${expires}.${sign(String(expires))}`, expires: new Date(expires) };
}
