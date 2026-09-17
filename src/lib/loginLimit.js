// Server-only. Locks the admin login for an IP address after repeated wrong passwords.
// Kept in memory: a server restart clears it, and each server process counts on its own.
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

// ip -> { failures, firstAt, lockedUntil }
const attempts = new Map();

function current(ip, now) {
  const entry = attempts.get(ip);
  // Failures older than the lock window are forgotten.
  if (entry && entry.lockedUntil <= now && now - entry.firstAt > LOCK_MS) {
    attempts.delete(ip);
    return null;
  }
  return entry ?? null;
}

/** Milliseconds until this IP may try again; 0 when it isn't locked. */
export function lockRemaining(ip, now = Date.now()) {
  const entry = current(ip, now);
  return entry ? Math.max(0, entry.lockedUntil - now) : 0;
}

export function recordFailure(ip, now = Date.now()) {
  const entry = current(ip, now) ?? { failures: 0, firstAt: now, lockedUntil: 0 };
  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) {
    entry.lockedUntil = now + LOCK_MS;
    entry.failures = 0;
    entry.firstAt = now;
  }
  attempts.set(ip, entry);

  // Now and then, forget addresses whose failures have expired.
  if (attempts.size > 1000) {
    for (const key of [...attempts.keys()]) current(key, now);
  }
}

export function clearFailures(ip) {
  attempts.delete(ip);
}

/**
 * Client IP from the request headers. The hosting proxy appends the real address as the last
 * X-Forwarded-For entry; earlier entries can be forged by the client, so they're ignored.
 */
export function clientIp(headerList) {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",").at(-1).trim();
  return headerList.get("x-real-ip") ?? "local";
}
