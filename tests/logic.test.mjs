import test from "node:test";
import assert from "node:assert/strict";
import { csvCell } from "../src/lib/csv.js";
import { normalizePhoneDigits, formatLocalPhone, isValidLocalPhone } from "../src/lib/phone.js";
import { calculatePayment } from "../src/lib/calculator.js";
import { withPublicContacts } from "../src/lib/publicContacts.js";
import { validateContent } from "../src/lib/contentValidation.js";
import { createLeadLimiter, leadClient } from "../src/lib/leadLimit.js";
import { readJsonBody, BodyTooLarge } from "../src/lib/requestBody.js";
import { createSession, verifySession } from "../src/lib/session.js";
import * as defaults from "../src/data/mock.js";

test("CSV formula-like and control-prefixed cells are text; quoting survives", () => {
  for (const value of ["=1+1", "+1+1", "-1+1", "@SUM(A1)", " \t=2", "\ttext", "\r=2", "\n=2"]) {
    assert.ok(csvCell(value).startsWith("\"'"), JSON.stringify(value));
  }
  assert.equal(csvCell('a,"b"\nc'), '"a,""b""\nc"');
  assert.equal(csvCell(null), '""');
  assert.equal(csvCell("normal"), '"normal"');
});

test("phone normalization preserves excess digits for rejection", () => {
  for (const input of ["501234567", "+994 50 123 45 67", "0501234567"]) {
    assert.equal(normalizePhoneDigits(input), "501234567");
    assert.ok(isValidLocalPhone(normalizePhoneDigits(input)));
  }
  const extra = normalizePhoneDigits("+994 50 123 45 678");
  assert.equal(extra, "5012345678");
  assert.equal(isValidLocalPhone(extra), false);
  assert.equal(formatLocalPhone(extra).replaceAll(" ", ""), extra);
  assert.equal(isValidLocalPhone("221234567"), false);
});

test("calculator recalculates and rejects invalid bounds", () => {
  assert.equal(Math.round(calculatePayment(250000, 37000, 36).monthly), 5917);
  assert.equal(calculatePayment(100, 100, 1).monthly, 0);
  for (const values of [[0,0,1], ["",0,1], [100,101,1], [100,-1,1], [100,0,0], [100,0,1.5], [Infinity,0,1], [100,0,""]]) {
    assert.equal(calculatePayment(...values), null, JSON.stringify(values));
  }
});

test("public contacts come from the admin content; only the sample placeholder is hidden", () => {
  const hidden = withPublicContacts(defaults);
  assert.equal(hidden.contactPage.office.phoneHref, "");
  assert.equal(hidden.contactPage.office.whatsappHref, "");
  assert.ok(!JSON.stringify(hidden.contactPage.office).includes("000 00 00"));
  assert.ok(!hidden.footer.links.some((link) => /^tel:|wa\.me/.test(link.href)));
  const withOffice = (office, links = defaults.footer.links) => withPublicContacts({
    ...defaults,
    contactPage: { ...defaults.contactPage, office: { ...defaults.contactPage.office, ...office } },
    footer: { ...defaults.footer, links },
  });
  const shown = withOffice(
    { phoneHref: "tel:+994 50 123 45 67", whatsappHref: "https://wa.me/994551234567" },
    [{ label: "+994 50 123 45 67", href: "tel:+994501234567" }, { label: "WhatsApp", href: "https://wa.me/994551234567" }],
  );
  assert.equal(shown.contactPage.office.phoneHref, "tel:+994 50 123 45 67");
  assert.equal(shown.contactPage.office.whatsappHref, "https://wa.me/994551234567");
  assert.equal(shown.footer.links.length, 2);
  assert.ok(shown.contactPage.office.details.some((detail) => /telefon/i.test(detail.label)));
  assert.equal(withOffice({ phoneHref: "tel:+99412" }).contactPage.office.phoneHref, "");
  assert.equal(withOffice({ whatsappHref: "https://wa.me/994500000000" }).contactPage.office.whatsappHref, "");
});

test("valid legacy and uploaded content passes; malformed sections/IDs are rejected", () => {
  assert.doesNotThrow(() => validateContent(defaults));
  const uploaded = structuredClone({ ...defaults });
  uploaded.apartments[0].planImage = { src: "/media/12345678-1234-1234-1234-123456789abc.webp", width: 100, height: 200 };
  uploaded.apartments[0].photos = [{ ...uploaded.apartments[0].planImage, alt: "Photo" }];
  delete uploaded.apartments[0].plan;
  uploaded.news[0].cover = null;
  uploaded.contactPage.faqs = [];
  uploaded.gallery.photos = [];
  assert.doesNotThrow(() => validateContent(uploaded, { ru: {}, en: {} }));
  for (const change of [
    (data) => { data.apartments = null; },
    (data) => { data.gallery = 42; },
    (data) => { data.contactPage.faqs = ["oops"]; },
    (data) => { data.apartments[0].id = ""; },
    (data) => { data.news[1].id = data.news[0].id; },
    (data) => { data.apartments[0].area = "NaN"; },
    (data) => { data.paymentCalculator.months = 0; },
    (data) => { data.footer.links[0].href = "javascript:alert(1)"; },
    (data) => { data.apartments[0].photos = [null]; },
    (data) => { data.apartmentFilters[0].options = []; },
  ]) {
    const data = structuredClone({ ...defaults }); change(data);
    assert.throws(() => validateContent(data));
  }
  assert.throws(() => validateContent(defaults, { ru: [] }));
});

test("limiter expires entries, is bounded, and refuses arbitrary forwarded identity", () => {
  const limit = createLeadLimiter({ limit: 2, windowMs: 100, maxEntries: 2 });
  assert.equal(limit("a", 0), 0);
  assert.equal(limit("a", 1), 0);
  assert.equal(limit("a", 2), 98);
  assert.equal(limit("b", 2), 0);
  assert.equal(limit("c", 3), 100);
  assert.equal(limit("c", 103), 0);
  const defaults = createLeadLimiter();
  for (let i = 0; i < 120; i++) assert.equal(defaults("shared", 0), 0);
  assert.equal(defaults("shared", 1), 59_999);
  assert.equal(defaults("shared", 60_000), 0);
  for (let i = 0; i < 5; i++) assert.equal(defaults("192.0.2.1", 60_000), 0);
  assert.equal(defaults("192.0.2.1", 60_001), 59_999);
  const previous = process.env.TRUSTED_CLIENT_IP_HEADER;
  try {
    delete process.env.TRUSTED_CLIENT_IP_HEADER;
    assert.equal(leadClient(new Headers({ "x-forwarded-for": "1.2.3.4" })), "shared");
    process.env.TRUSTED_CLIENT_IP_HEADER = "x-test-client-ip";
    assert.equal(leadClient(new Headers()), "shared");
    assert.equal(leadClient(new Headers({ "x-test-client-ip": "invalid" })), "shared");
    assert.equal(leadClient(new Headers({ "x-test-client-ip": "1.2.3.4, 192.0.2.1" })), "192.0.2.1");
  } finally {
    if (previous === undefined) delete process.env.TRUSTED_CLIENT_IP_HEADER;
    else process.env.TRUSTED_CLIENT_IP_HEADER = previous;
  }
});

test("body cap counts streamed bytes with missing/forged length", async () => {
  const request = (chunks, headers = {}) => new Request("http://local.test", {
    method: "POST", duplex: "half", headers,
    body: new ReadableStream({ start(controller) {
      for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
      controller.close();
    } }),
  });
  assert.deepEqual(await readJsonBody(request(['{"ok":', 'true}'])), { ok: true });
  await assert.rejects(readJsonBody(request(["x".repeat(17)], { "content-length": "1" }), 16), BodyTooLarge);
  await assert.rejects(readJsonBody(request(["x".repeat(17)]), 16), BodyTooLarge);
  await assert.rejects(readJsonBody(request(["{"])), SyntaxError);
});

test("session cookies verify only when signed with the current secret and unexpired", () => {
  const saved = { ...process.env };
  try {
    Object.assign(process.env, { ADMIN_USERNAME: "a", ADMIN_PASSWORD: "b", ADMIN_SESSION_SECRET: "secret-one" });
    const { value, expires } = createSession(1_000_000);
    assert.ok(expires instanceof Date);
    assert.equal(verifySession(value, 1_000_001), true);
    assert.equal(verifySession(value, expires.getTime() + 1), false, "expired");
    assert.equal(verifySession(value + "x", 1_000_001), false, "tampered signature");
    assert.equal(verifySession(value.replace(/^\d+/, (n) => String(Number(n) + 1)), 1_000_001), false, "tampered expiry");
    for (const bad of [undefined, "", "garbage", "abc.def", "123"]) assert.equal(verifySession(bad, 1_000_001), false);
    process.env.ADMIN_SESSION_SECRET = "secret-two";
    assert.equal(verifySession(value, 1_000_001), false, "rotating the secret revokes sessions");
    delete process.env.ADMIN_SESSION_SECRET;
    assert.equal(verifySession(value, 1_000_001), false, "unconfigured auth never verifies");
  } finally {
    for (const key of ["ADMIN_USERNAME", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"]) {
      if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
    }
  }
});
