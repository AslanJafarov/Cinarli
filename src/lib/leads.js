import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { dataDir } from "./store";

// Server-only. Leads from the website forms, kept next to the admin data (storage/leads.json),
// newest first. Shown in the admin panel under "Müraciətlər".
const leadsFile = path.join(dataDir, "leads.json");

async function readAll() {
  try {
    const parsed = JSON.parse(await fs.promises.readFile(leadsFile, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Writes run one after another, so two leads arriving together can't overwrite each other.
let queue = Promise.resolve();
function update(change) {
  const run = queue.then(async () => {
    const next = change(await readAll());
    await fs.promises.mkdir(dataDir, { recursive: true });
    const temp = `${leadsFile}.${randomUUID()}.tmp`;
    await fs.promises.writeFile(temp, JSON.stringify(next, null, 2));
    await fs.promises.rename(temp, leadsFile);
    return next;
  });
  queue = run.catch(() => {});
  return run;
}

export const readLeads = readAll;

export async function addLead(lead) {
  const saved = { id: randomUUID(), status: "new", createdAt: new Date().toISOString(), ...lead };
  await update((leads) => [saved, ...leads]);
  return saved;
}

export const setLeadStatus = (id, status) =>
  update((leads) =>
    leads.map((lead) =>
      lead.id === id ? { ...lead, status: status === "done" ? "done" : "new" } : lead,
    ),
  );

export const deleteLead = (id) => update((leads) => leads.filter((lead) => lead.id !== id));
