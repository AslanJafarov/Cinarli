import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { dataDir } from "./dataDir.js";

// Server-only. "Under construction" switch for the public site (admin panel → "Tikinti rejimi").
// Kept in its own small file, separate from site.json, so flipping it never conflicts with an
// unsaved content draft and never needs a content revision. Read by src/proxy.js on every
// public request, so the read is a cheap mtime check with the parsed value cached.
const file = path.join(dataDir, "maintenance.json");

let cached = { mtimeMs: -1, enabled: false };

export function isMaintenanceOn() {
  let mtimeMs;
  try {
    mtimeMs = fs.statSync(file).mtimeMs;
  } catch {
    return false; // No file: the site is open.
  }
  if (mtimeMs !== cached.mtimeMs) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
      cached = { mtimeMs, enabled: parsed?.enabled === true };
    } catch {
      return cached.enabled; // Half-written or damaged: keep the last known state.
    }
  }
  return cached.enabled;
}

export async function setMaintenance(enabled) {
  const next = Boolean(enabled);
  await fs.promises.mkdir(dataDir, { recursive: true });
  const temp = `${file}.${randomUUID()}.tmp`;
  await fs.promises.writeFile(
    temp,
    JSON.stringify({ enabled: next, changedAt: new Date().toISOString() }, null, 2),
  );
  await fs.promises.rename(temp, file);
  cached = { mtimeMs: -1, enabled: next };
  return next;
}
