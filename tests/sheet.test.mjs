import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

test("Google Sheets copy: guarded rows, synced leads recorded, failed leads stay pending", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "cinarli-test-"));
  process.env.DATA_DIR = directory;
  process.env.LEADS_SHEET_URL = "https://script.google.com/macros/s/test/exec";
  process.env.LEADS_SHEET_SECRET = "s3cret";
  t.after(async () => {
    // Only this test's mkdtemp directory is removed.
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep));
    assert.ok(path.basename(directory).startsWith("cinarli-test-"));
    await fs.rm(directory, { recursive: true, force: true });
  });

  const { addLead, readLeads } = await import("../src/lib/leads.js");
  const { SHEET_HEADER, isSheetConfigured, leadRow, syncToSheet } = await import("../src/lib/leadSheet.js");
  assert.ok(isSheetConfigured());

  const lead = await addLead({
    phone: "+994501234567", source: "apartment", apartmentId: "A1", page: '=HYPERLINK("x")',
    locale: "ru", utm: { utm_source: "+fb" }, landingPage: "/",
  });
  const row = leadRow(lead);
  assert.equal(row.length, SHEET_HEADER.length);
  assert.equal(row[0], lead.createdAt);
  assert.equal(row[1], "994 50 123 45 67");
  assert.equal(row[2], "Mənzil səhifəsi");
  assert.equal(row[4], `'=HYPERLINK("x")`); // Formula-like text stays text in the sheet.
  assert.equal(row[5], "RU");
  assert.equal(row[6], "'+fb");
  assert.equal(row[7], "");
  assert.equal(row.at(-1), lead.id);

  const calls = [];
  const fetchMock = t.mock.method(globalThis, "fetch", async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return Response.json({ ok: true, added: 1, skipped: 0 });
  });
  assert.equal(await syncToSheet(await readLeads()), 1);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, process.env.LEADS_SHEET_URL);
  assert.equal(calls[0].body.secret, "s3cret");
  assert.deepEqual(calls[0].body.header, SHEET_HEADER);
  assert.equal(calls[0].body.rows[0].at(-1), lead.id);
  assert.ok((await readLeads())[0].sheetSyncedAt);

  // Nothing pending: no request.
  assert.equal(await syncToSheet(await readLeads()), 0);
  assert.equal(calls.length, 1);

  // A sign-in page instead of the script (deployment not "Anyone"): the lead stays pending.
  const second = await addLead({ phone: "+994551234567", source: "footer" });
  fetchMock.mock.mockImplementation(async () => new Response("<html>Sign in</html>", { status: 200 }));
  await assert.rejects(syncToSheet(await readLeads()), /deployed with access "Anyone"/);
  const pending = async () => (await readLeads()).find((item) => item.id === second.id).sheetSyncedAt;
  assert.equal(await pending(), undefined);

  // The script refusing the secret: still pending.
  fetchMock.mock.mockImplementation(async () => Response.json({ ok: false, error: "forbidden" }));
  await assert.rejects(syncToSheet(await readLeads()), /forbidden/);
  assert.equal(await pending(), undefined);

  // Google reachable again: only the pending lead goes, the first one is not sent twice.
  fetchMock.mock.mockImplementation(async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return Response.json({ ok: true, added: 1, skipped: 0 });
  });
  assert.equal(await syncToSheet(await readLeads()), 1);
  assert.deepEqual(calls.at(-1).body.rows.map((cells) => cells.at(-1)), [second.id]);
  assert.ok(await pending());
});
