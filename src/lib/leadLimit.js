import { isIP } from "node:net";

// One serving Node process. No unverified forwarding header is trusted by default.
export function leadClient(headers) {
  const header = process.env.TRUSTED_CLIENT_IP_HEADER;
  if (!header) return "shared";
  const value = headers.get(header)?.split(",").at(-1).trim();
  return value && isIP(value) ? value : "shared";
}

export function createLeadLimiter({ limit = 5, sharedLimit = 120, windowMs = 60_000, maxEntries = 10_000 } = {}) {
  const attempts = new Map();
  return (key, now = Date.now()) => {
    for (const [ip, entry] of attempts) if (entry.until <= now) attempts.delete(ip);
    let entry = attempts.get(key);
    // Refuse new keys when full instead of evicting active limits that could then be bypassed.
    if (!entry && attempts.size >= maxEntries) return windowMs;
    if (!entry) {
      entry = { count: 0, until: now + windowMs };
      attempts.set(key, entry);
    }
    // Unknown visitors share this bucket: allow ordinary site-wide traffic until the proxy is configured.
    if (entry.count >= (key === "shared" ? sharedLimit : limit)) return entry.until - now;
    entry.count += 1;
    return 0;
  };
}

export const limitLead = createLeadLimiter();
