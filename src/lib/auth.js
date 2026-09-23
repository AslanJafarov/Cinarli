import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ADMIN_COOKIE, createSession, isAuthConfigured, safeEqual, verifySession } from "./session";

// Server-only. Credentials come from ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_SESSION_SECRET
// (see .env.example); without them nobody can log in. Cookie signing lives in ./session.js.
export { isAuthConfigured };

export function checkCredentials(username, password) {
  if (!isAuthConfigured()) return false;
  const userOk = safeEqual(username, process.env.ADMIN_USERNAME);
  const passwordOk = safeEqual(password, process.env.ADMIN_PASSWORD);
  return userOk && passwordOk;
}

export async function startSession() {
  const { value, expires } = createSession();
  (await cookies()).set(ADMIN_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function endSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function isLoggedIn() {
  // Request-time rendering must start before the configuration check, or a build without
  // credentials freezes the "not configured" state into the login page.
  await connection();
  if (!isAuthConfigured()) return false;
  return verifySession((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** For admin pages and Server Actions: sends visitors without a session to the login page. */
export async function requireAdmin() {
  if (!(await isLoggedIn())) redirect("/admin/login");
}
