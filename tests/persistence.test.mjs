import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import * as defaults from "../src/data/mock.js";

test("single-process persistence: revisions, concurrency, corruption, recovery and deduplication", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "cinarli-test-"));
  process.env.DATA_DIR = directory;
  const { saveData, saveMode, readStore, getSiteData } = await import("../src/lib/store.js");
  const { addLead, readLeads } = await import("../src/lib/leads.js");
  t.after(async () => {
    // Only this test's mkdtemp directory is removed.
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep));
    assert.ok(path.basename(directory).startsWith("cinarli-test-"));
    await fs.rm(directory, { recursive: true, force: true });
  });
  assert.equal(getSiteData().mode, "mock");
  const first = await saveData({ ...defaults }, {}, 0);
  assert.equal(first.revision, 1);
  const attempts = await Promise.allSettled(Array.from({ length: 10 }, (_, i) => saveData({
    ...defaults, projectStats: [{ value: String(i), label: "saved" }],
  }, {}, 1)));
  assert.equal(attempts.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(readStore().revision, 2);
  await assert.rejects(saveMode("production", 1));
  assert.equal((await saveMode("production", 2)).revision, 3);

  const siteFile = path.join(directory, "site.json");
  await fs.writeFile(siteFile, "{ broken");
  await assert.rejects(saveData({ ...defaults }, {}, 3));
  assert.equal(await fs.readFile(siteFile, "utf8"), "{ broken");
  assert.doesNotThrow(() => getSiteData()); // Public fallback remains available.
  await fs.writeFile(siteFile, JSON.stringify({ mode: "mock", data: {}, translations: {} }));
  assert.equal((await saveData({ ...defaults }, {}, 0)).revision, 1); // Legacy file and recovered queue.

  const lead = { phone: "+994501234567", source: "apartment", apartmentId: "A" };
  const duplicates = await Promise.all(Array.from({ length: 10 }, () => addLead(lead)));
  assert.equal(new Set(duplicates.map((item) => item.id)).size, 1);
  await addLead({ ...lead, apartmentId: "B" });
  assert.equal((await readLeads()).length, 2);
  const leadsFile = path.join(directory, "leads.json");
  for (const broken of ["{broken", "{}"]) {
    await fs.writeFile(leadsFile, broken);
    await assert.rejects(addLead(lead));
    assert.equal(await fs.readFile(leadsFile, "utf8"), broken);
  }
  await fs.writeFile(leadsFile, "[]");
  await addLead(lead);
  assert.equal((await readLeads()).length, 1); // A failed write didn't poison the queue.

  // Under-construction flag: its own file, atomic writes, damaged file keeps the last state.
  const { isMaintenanceOn, setMaintenance } = await import("../src/lib/maintenance.js");
  const flagFile = path.join(directory, "maintenance.json");
  assert.equal(isMaintenanceOn(), false);
  assert.equal(await setMaintenance(true), true);
  assert.equal(isMaintenanceOn(), true);
  assert.deepEqual(Object.keys(JSON.parse(await fs.readFile(flagFile, "utf8"))).sort(), ["changedAt", "enabled"]);
  await fs.writeFile(flagFile, "{ broken");
  assert.equal(isMaintenanceOn(), true);
  assert.equal(await setMaintenance(false), false);
  assert.equal(isMaintenanceOn(), false);
  // Another process flipping the file is picked up by mtime, not only through setMaintenance().
  await new Promise((resolve) => setTimeout(resolve, 20));
  await fs.writeFile(flagFile, JSON.stringify({ enabled: true }));
  assert.equal(isMaintenanceOn(), true);
});
