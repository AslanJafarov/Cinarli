# Leads in Google Sheets

Every lead from the website forms is saved on the server (`leads.json`, shown in the admin panel
under "Müraciətlər"). This optional step also copies each lead into a Google Sheet, through a small
Apps Script attached to that sheet. The server side lives in `src/lib/leadSheet.js`.

## 1. Create the sheet

Sign in to the company Google account, create a new spreadsheet (for example "Çinarlı müraciətlər")
and leave the first sheet empty. The script writes the header row itself with the first lead.

Set the sheet's time zone so the "Tarix" column shows Baku time: File → Settings → Time zone →
(GMT+04:00) Baku.

## 2. Add the script

In the spreadsheet open Extensions → Apps Script, delete the sample code and paste this. Replace the
secret with a long random string (letters and digits, 32 or more characters) and keep it: the server
needs the same value.

```js
// Çinarlı website: receives leads and appends them to the first sheet.
var SECRET = "PASTE-A-LONG-RANDOM-SECRET";

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (error) {
    return reply({ ok: false, error: "bad request" });
  }
  if (!body || body.secret !== SECRET) return reply({ ok: false, error: "forbidden" });

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var width = body.header.length;
    if (sheet.getLastRow() === 0) sheet.appendRow(body.header);

    // The last column holds the lead id: a lead already in the sheet is not added twice.
    var known = {};
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, width, lastRow - 1, 1).getValues().forEach(function (cells) {
        known[String(cells[0])] = true;
      });
    }
    var rows = body.rows
      .filter(function (row) { return !known[String(row[row.length - 1])]; })
      .map(function (row) {
        row[0] = new Date(row[0]); // First column: when the lead arrived.
        return row;
      });
    if (rows.length > 0) sheet.getRange(lastRow + 1, 1, rows.length, width).setValues(rows);
    return reply({ ok: true, added: rows.length, skipped: body.rows.length - rows.length });
  } finally {
    lock.releaseLock();
  }
}

// Opening the web app URL in a browser shows this, which confirms the deployment works.
function doGet() {
  return reply({ ok: true, service: "cinarli-leads" });
}

function reply(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Save the project (any name).

## 3. Deploy it as a web app

Deploy → New deployment → type "Web app":

- Execute as: **Me** (the company account).
- Who has access: **Anyone**. This is required: the website's server is not signed in to Google,
  and with any other setting it receives a sign-in page instead of the script. The secret is what
  keeps strangers out.

Authorize the script when asked, then copy the **Web app URL** (it ends in `/exec`). Open it in a
browser: it must show `{"ok":true,"service":"cinarli-leads"}`.

After any later change to the script, create a new deployment version (Deploy → Manage
deployments → edit → Version: New version). Saving alone does not change what the URL runs.

## 4. Tell the server

In cPanel → Setup Node.js App → the site's app → Environment variables, add:

| Variable             | Value                        |
| -------------------- | ---------------------------- |
| `LEADS_SHEET_URL`    | the Web app URL from step 3  |
| `LEADS_SHEET_SECRET` | the secret from step 2       |

Save and restart the app. Locally, the same two lines go into `.env.local`.

## How it behaves

- A new lead is answered to the visitor first and copied to the sheet right after. If Google is
  slow or down, the lead is still in the admin panel; it just stays marked as not yet copied.
- The admin panel's "Müraciətlər" tab gets a "Google Sheets" button. It sends every lead that is
  not in the sheet yet, including all leads from before this setup, and reports how many went.
- The script skips any lead id it already has, so a retry never produces duplicate rows.
- Only new leads are copied. Marking a lead as "Baxıldı" or deleting it in the admin panel does
  not change the sheet.
- Failures are written to the app log (`[lead] copy to Google Sheets failed`). The usual causes are
  a deployment not set to "Anyone", a changed secret, or a script edit without a new version.
