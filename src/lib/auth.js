import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Server-only. Credentials come from ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_SESSION_SECRET
// (see .env.local); without them nobody can log in.
const COOKIE = "cinarli_admin";
const SESSION_DAYS = 7;

const secret = () => process.env.ADMIN_SESSION_SECRET;

export const isAuthConfigured = () =>
  Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && secret());

const sign = (value) => createHmac("sha256", secret()).update(value).digest("base64url");

function safeEqual(a, b) {
  // Hashing first gives equal lengths, so the comparison never leaks the length either.
  const hash = (text) => createHmac("sha256", "compare").update(String(text)).digest();
  return timingSafeEqual(hash(a), hash(b));
}

export function checkCredentials(username, password) {
  if (!isAuthConfigured()) return false;
  const userOk = safeEqual(username, process.env.ADMIN_USERNAME);
  const passwordOk = safeEqual(password, process.env.ADMIN_PASSWORD);
  return userOk && passwordOk;
}

export async function startSession() {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const value = `${expires}.${sign(String(expires))}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isLoggedIn() {
  if (!isAuthConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}

/** For admin pages and Server Actions: sends visitors without a session to the login page. */
export async function requireAdmin() {
  if (!(await isLoggedIn())) redirect("/admin/login");
}
