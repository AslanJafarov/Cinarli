import { plainText } from "./csv.js";
import { LANGUAGES, SOURCES, formatPhone } from "./leadLabels.js";
import { markLeadsSynced } from "./leads.js";

// Server-only. Copies leads to a Google Sheet through an Apps Script web app; docs/google-sheets.md
// has the sheet setup and the script. Every lead is saved to leads.json first (./leads.js); the
// sheet is a copy. A lead that could not be copied keeps no `sheetSyncedAt`, so the next attempt
// (the admin panel's "Google Sheets" button, or the same request repeated) sends it again, and
// the script skips ids it already has.

export const SHEET_HEADER = [
  "Tarix", "Telefon", "Forma", "Mənzil", "Səhifə", "Dil",
  "UTM source", "UTM medium", "UTM campaign", "UTM term", "UTM content", "İlk səhifə", "ID",
];

// Apps Script writes a few hundred rows per call without trouble; smaller batches keep calls short.
const BATCH = 100;
const TIMEOUT_MS = 20_000;

export const isSheetConfigured = () =>
  Boolean(process.env.LEADS_SHEET_URL && process.env.LEADS_SHEET_SECRET);

/** One sheet row: the ISO time first (the script turns it into a date), the lead id last. */
export function leadRow(lead) {
  const utm = lead.utm ?? {};
  return [
    lead.createdAt,
    // "994 50 123 45 67": the spaces keep it text, and without "+" it needs no formula guard.
    formatPhone(lead.phone).replace(/^\+/, ""),
    ...[
      SOURCES[lead.source] ?? lead.source,
      lead.apartmentId,
      lead.page,
      LANGUAGES[lead.locale] ?? lead.locale,
      utm.utm_source,
      utm.utm_medium,
      utm.utm_campaign,
      utm.utm_term,
      utm.utm_content,
      lead.landingPage,
    ].map(plainText),
    lead.id,
  ];
}

/** Posts rows to the script. Resolves to its reply ({ ok, added, skipped }); throws otherwise. */
export async function sendRows(rows) {
  const response = await fetch(process.env.LEADS_SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: process.env.LEADS_SHEET_SECRET, header: SHEET_HEADER, rows }),
    // Apps Script answers with a redirect to the script's output; fetch follows it.
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await response.text();
  let reply = null;
  try {
    reply = JSON.parse(text);
  } catch {
    // Not the script's JSON (a Google sign-in page, for example): reported below.
  }
  if (!response.ok || !reply?.ok) {
    const reason = reply?.error
      ?? (reply
        ? "unexpected reply"
        : `no JSON reply (HTTP ${response.status}); is the web app deployed with access "Anyone"?`);
    throw new Error(`Google Sheets did not accept the leads: ${reason}`);
  }
  return reply;
}

/**
 * Sends every lead without `sheetSyncedAt`, in batches, recording each batch once the script
 * confirmed it. Throws when the sheet can't be reached; batches sent before that stay recorded.
 * Resolves to the number of leads sent.
 */
export async function syncToSheet(leads) {
  const pending = leads.filter((lead) => !lead.sheetSyncedAt);
  for (let start = 0; start < pending.length; start += BATCH) {
    const batch = pending.slice(start, start + BATCH);
    await sendRows(batch.map(leadRow));
    await markLeadsSynced(batch.map((lead) => lead.id));
  }
  return pending.length;
}
