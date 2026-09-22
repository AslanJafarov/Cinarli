import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { dataDir } from "./store.js";

// Server-only. Leads from the website forms, kept next to the admin data (storage/leads.json),
// newest first. Shown in the admin panel under "Müraciətlər".
const leadsFile = path.join(dataDir, "leads.json");

async function readAll() {
  try {
    const parsed = JSON.parse(await fs.promises.readFile(leadsFile, "utf8"));
    if (!Array.isArray(parsed)) throw new Error("leads.json must contain an array");
    return parsed;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

// Writes run one after another, so two leads arriving together can't overwrite each other.
const writes = globalThis[Symbol.for("cinarli.leadWrites")] ??= { queue: Promise.resolve() };
function update(change) {
  const run = writes.queue.then(async () => {
    const current = await readAll();
    const next = change(current);
    if (next === current) return current;
    await fs.promises.mkdir(dataDir, { recursive: true });
    const temp = `${leadsFile}.${randomUUID()}.tmp`;
    await fs.promises.writeFile(temp, JSON.stringify(next, null, 2));
    await fs.promises.rename(temp, leadsFile);
    return next;
  });
  writes.queue = run.catch(() => {});
  return run;
}

export const readLeads = readAll;

export async function addLead(lead) {
  let saved;
  await update((leads) => {
    saved = leads.find((item) => item.phone === lead.phone && item.source === lead.source &&
      item.apartmentId === lead.apartmentId && Date.now() - Date.parse(item.createdAt) < 60_000);
    if (saved) return leads;
    saved = { ...lead, id: randomUUID(), status: "new", createdAt: new Date().toISOString() };
    return [saved, ...leads];
  });
  return saved;
}

export const setLeadStatus = (id, status) =>
  update((leads) =>
    leads.map((lead) =>
      lead.id === id ? { ...lead, status: status === "done" ? "done" : "new" } : lead,
    ),
  );

export const deleteLead = (id) => update((leads) => leads.filter((lead) => lead.id !== id));
