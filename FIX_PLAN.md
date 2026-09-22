# Çınarlı Park remediation plan

Revised: 22 September 2026. Based on [AUDIT.md](AUDIT.md), covering all 25 findings. Baseline: `85c6427` on `main`.

Implementation has started and the repository fixes are now locally verified. See the [audit implementation update](AUDIT.md#implementation-update--22-september-2026) for evidence and remaining host/deployment checks. The PR labels below describe the agreed work groups; commits and production deployment have not been performed.

Ship small fixes against the existing application. Keep the current design, JSON storage, callback forms, CSV export, and AZ/RU/EN support. This is an implementation plan; findings remain open until their checks pass.

## Decisions and first steps

- **Ask the host first:** how many Node processes/instances can serve this app at the same time, including during restarts? Confirmation is pending. The checked-in server starts one plain Node process; that does not establish Passenger's actual configuration.
- **If one process is confirmed:** use a module-level mutex plus a revision for site saves, the existing lead-write queue, and an in-memory lead limiter. If several processes are confirmed, first determine whether the host can pin this small app to one. Only retained multiple-process operation requires a separate coordination decision. This question affects PR3/PR4, not the quick wins or UI repairs.
- **Keep the public fallback:** missing content continues to show the existing sample content. Do not introduce an unavailable page or a new publishing system. Separately, reject writes that would overwrite corrupt stored data. Changing what the public sees when storage is unavailable is a later business decision.
- **Mitigate the fake phone immediately:** hide unverified call/WhatsApp actions, including the known sample number, and omit that number from displayed contact details and structured data. Keep callback forms available. Restore direct contact actions only after a verified number is supplied and used consistently in office/footer/mobile variants.
- **Use Node's built-in test runner and GitHub Actions:** add `npm test` backed by `node --test`, tests under `tests/`, and `.github/workflows/ci.yml` in PR1. Unit tests need no new dependencies. CI runs `npm ci`, `npm run lint`, `npm run build`, then `npm test`. Build without admin secrets; the auth integration test starts that build with temporary runtime credentials and an isolated `DATA_DIR`. Pin a supported Node version matching deployment.

## Delivery order

| Work | Scope | Depends on |
| --- | --- | --- |
| Immediate mitigation / hosting | Hide fake contact actions; renew TLS and enforce HTTPS | Host access for certificates/redirects; hiding fake contacts can ship now |
| PR1 | Eight quick wins and the test/CI baseline | No storage or modal redesign |
| PR2 | Working calculator and callback destinations | Existing forms; independent of PR3/PR4 |
| PR3 | Safe saves, corrupt-lead protection, content validation, import repair | Process count for the locking choice |
| PR4 | Lead body cap, in-memory rate limit, short duplicate window | Process count and trusted proxy identity |
| PR5 | Gallery/apartment media and the remaining keyboard/navigation fixes | Existing components |
| Deployment repair | Correct cPanel tasks and a short deployment runbook | Actual Passenger startup/restart and persistent directory settings |

PR numbers are the suggested merge order, not dependencies between unrelated fixes. Hosting work proceeds alongside repository changes. Corrupt-lead protection can ship independently as soon as ready.

## PR1 — Eight quick wins

| Finding | Smallest fix and main files | Check |
| --- | --- | --- |
| H03: frozen login | In `src/lib/auth.js`, call `await connection()` from `next/server` before the configuration check in the shared login check. Keep authorization on actions and uploads. | Build without credentials, start with credentials, verify login renders and authenticated/unauthenticated access behaves correctly. |
| H13: wrong canonical | Set `NEXT_PUBLIC_SITE_URL` to the confirmed production origin at build time, correct the stale fallback in `src/lib/seo.js`, and replace the hardcoded origin in `src/components/admin/SitePreview.jsx` with existing configuration. | Rebuild; inspect canonical, hreflang, robots, sitemap, metadata images, and preview. No generated URL uses the unrelated domain. |
| H09: CSV formulas | Keep CSV. In `src/components/admin/LeadsEditor.jsx`, prefix dangerous text cells with an apostrophe before normal CSV quote escaping. Cover leading `=`, `+`, `-`, `@` and leading control characters that can conceal them. Apply at export to historical records too. | Test dangerous cells, embedded quotes, commas, and newlines; open a fixture in the admin's spreadsheet app and confirm formulas remain text. No XLSX dependency. |
| M06: phone truncation | In `src/lib/phone.js`, preserve excess digits after supported prefix normalization so exact-length validation rejects them. Check formatting does not hide the invalid input. | Valid local/international/trunk forms still work; an extra digit is rejected rather than submitted as a different number. |
| L01: reduced motion | In `src/app/globals.css`, override smooth scrolling with `scroll-behavior: auto` under `prefers-reduced-motion: reduce`. | Inspect computed scrolling behavior with reduced motion enabled. |
| L02: structured unit count | In `src/lib/seo.js`, use the existing saved project-stat value instead of the imported mock total. Resolve it from the base content so translated labels do not change the result. | Edit the total; visible statistics and JSON-LD agree in AZ/RU/EN. No new content model. |
| M05: unstable news IDs | In `src/components/admin/NewsEditor.jsx`, generate the initial ID for a new article and stop changing an existing ID when its title changes. Keep existing IDs intact. | Change a published title and save; the original URL still resolves. New articles still receive IDs. No alias/migration system. |
| M01: empty FAQ template | In `src/components/admin/FieldEditor.jsx`, retain an explicit object-item template for FAQ and the other affected structured lists even when empty. Use a small template map/prop in the existing editor. | Delete all FAQ entries, add one, edit question/answer, save and reload. Repeat for other affected object lists. No shared schema-metadata framework. |

The installed Next.js 16.3.5 documentation supports the request-time `connection()` approach. Read the relevant installed guide again when implementing framework changes. Use focused Node tests for export/phone logic and the production auth regression; use browser checks for the small editor/CSS changes rather than adding a UI test framework.

## PR2 — Make the sales actions work

**Findings:** H10, H11.

Make the calculator inputs and result a small client component in/alongside `src/components/PaymentCalculator.jsx`, retaining server-loaded localized content. Keep the current estimate, `(price - downPayment) / months`, and whole-AZN rounding. Validate finite positive price, down payment between zero and price, and positive integer months; invalid inputs must not leave an apparently valid stale result. Do not introduce interest, new financing rules, or apartment prices that are absent from the data.

Wire the four enquiry/manager/appointment buttons to the existing callback forms:

- Catalogue enquiry: open the selected apartment's existing callback flow and retain its apartment ID.
- Apartment manager: focus/open that page's `LeadBar`, including after the visitor has closed it.
- Contact appointment: reach the existing footer callback form with appointment-request context. Confirmation remains a callback request.
- Calculator manager: reach the existing footer callback form.

Also link the apartment's calculator action to the localized homepage `#odenis` section. Add a stable callback anchor and only the small focus/open handling needed by the existing forms; reuse `useLeadForm` for submission and states. No new modal system.

**Files:** `PaymentCalculator.jsx`, `ApartmentPicker.jsx`, `ApartmentDetail.jsx`, `ContactPage.jsx`, `LeadBar.jsx`, `FooterLeadForm.jsx`, and existing form/localization helpers.

**Checks:** 250,000 price, 37,000 down, and 36 months produces 5,917 AZN; invalid bounds show errors. Every action works by keyboard and touch in all locales. A completed apartment enquiry records the correct apartment/source/locale. Clicking a CTA alone never submits a lead.

## PR3 — Protect existing data

**Findings:** H05, H06, H07, M02. Use the confirmed single-process approach below.

1. In `src/lib/store.js`, serialize site and mode writes through one module-level mutex/queue. Read, compare the expected revision, and atomically replace the file inside that same critical section. Treat legacy files without a revision as revision zero. Return the new revision after success.
2. Pass that revision through `src/app/admin/actions.js` and `src/components/admin/AdminDashboard.jsx`. Reject a stale save with a clear conflict message and preserve the local draft. Mode changes use the same revision contract.
3. In `src/lib/leads.js`, retain the existing write queue. Only a missing file means an empty collection; malformed JSON, a non-array file, and read errors must stop writes while preserving the file. Apply the same protection to content write paths without changing public read fallback.
4. Add straightforward server-side validators for the editable section shapes, translations, required fields, finite numeric values, and nonempty/unique apartment/news IDs. Validate the proposed result before writing; return actionable errors. Preserve valid existing records and routes. Use plain functions, not a schema framework or shared client/server metadata architecture.
5. Fix partial import in `AdminDashboard.jsx` to merge supplied known sections into the current draft, not the initial snapshot. Preserve omitted saved and unsaved sections.

**Checks:** simultaneous saves from two clients cannot silently overwrite each other; a stale content or mode revision is rejected; the queue still works after a failed write. Missing-file initialization works, but corrupt files remain byte-for-byte intact. Malformed sections and duplicate IDs are rejected before persistence. A partial import preserves unrelated edits.

Use temporary directories and meaningful concurrent requests against one running server. Do not require multiple-process tests when production is confirmed to use one process. If multiple processes remain necessary, revise this section before claiming H05 resolved.

## PR4 — Bound public lead intake

**Finding:** H08. Keep the existing route, forms, and lead queue.

- Read the request stream with a byte cap before JSON parsing in `src/app/api/leads/route.js`. Check actual bytes even when `Content-Length` is missing or false. Next route handlers have no built-in body cap.
- Start with a configurable 16 KiB JSON limit and five submission attempts per minute per trusted client identity. Use a module-level map with expiration and bounded entries for the confirmed single-process host. Check the host's forwarded-header behavior before choosing the IP; do not trust arbitrary client-supplied headers.
- Within the existing serialized lead-write operation, suppress an identical normalized phone/source/apartment submission within a short window (initially 60 seconds). Return a successful acknowledgment for an already stored duplicate. Do not suppress a retry after a failed write or a request for a different apartment.
- Retain phone/field validation and the honeypot. Return 413 for an oversized body, 400 for malformed JSON, and 429 for throttling with retry guidance. Make the existing form show the appropriate localized error and preserve input.

**Files:** `src/app/api/leads/route.js`, `src/lib/leads.js`, a small limiter helper if useful, `src/components/useLeadForm.js`, and locale messages.

**Checks:** chunked/oversized bodies stop at the cap, normal enquiries succeed, concurrent identical submissions create one record, and bursts are throttled. Expired limiter entries are removed. Document that the in-memory limiter resets on restart. Shared-worker limiting, durable idempotency infrastructure, and lead pagination are outside this single-process fix.

## PR5 — Repair media and remaining interactions

| Findings | Minimal change | Check |
| --- | --- | --- |
| M03 | Render homepage tiles from the ordered `gallery.photos` used by the full gallery; remove stale `gallery.images` precedence in `Gallery.jsx`. Treat an intentionally empty photo list as empty. | Save/reorder/delete photos; homepage and gallery reflect the same collection. |
| M04 | Render `apartment.photos` in `ApartmentDetail.jsx`, reusing the existing gallery viewer. Keep the floor plan clearly identified. | Published apartment photos appear; empty/one/many-photo states work. |
| M07 | Preserve search parameters and the fragment during language switching in `Navbar.jsx` and existing navigation helpers. | Switch AZ/RU/EN on a filtered/anchored URL without losing state or hydration correctness. |
| M08 | Repair focus entry, containment, background exclusion, Escape, and restoration in the existing gallery/mobile overlays. | Tab/Shift+Tab stays inside; closing restores the trigger. This repair is independent of the callback buttons. |
| M09 | Add visible `focus-within` styling to the quick-search wrapper while retaining its native select. | Keyboard focus and selection are visible. |
| M10 | Make floor-plan enlargement a real button using the existing viewer, with keyboard/touch controls. | Open, enlarge, and close without hover. |

**Files:** `Gallery.jsx`, `GalleryGrid.jsx`, `ApartmentDetail.jsx`, `Navbar.jsx`, `QuickSearch.jsx`, `PlanCard.jsx`, and existing gallery/navigation helpers.

Check desktop, a narrow mobile viewport, keyboard use, and AZ/RU/EN on the changed flows. A new shared modal framework, design documents, a full screen-reader audit, and performance measurement are not prerequisites.

## Hosting and deployment work

**Findings:** H01, H02, H04, H12; deployment configuration also completes H13.

1. Renew certificates and the full chain for both hostnames; verify renewal. Once HTTPS works, redirect HTTP (including admin/login) and the alternate hostname to the chosen HTTPS origin while preserving paths/queries. Verify before enabling HSTS.
2. Ship the fake-contact safeguard immediately. Re-enable call/WhatsApp actions only when verified contact data is available; check duplicate footer/contact values and structured data together. Until then H12 is mitigated, not a claim that sales contact details have been verified.
3. Repair `.cpanel.yml` around the actual Passenger startup/restart command. Deploy a fresh application directory, include `server.js` and required assets, run `npm ci` and `npm run build`, check readiness, then activate/restart through the supported host mechanism. Keep the prior code directory for rollback.
4. Keep writable `DATA_DIR` outside replaceable application directories. Remove the copy of ignored `storage`; never copy sample data over live content/leads. Rehearse one backup/restore in an isolated directory and verify data survives restart/code rollback.
5. Add a short README runbook and tracked environment example covering admin credentials, session secret, public origin, persistent data, build/start/restart, and rollback. Adjust `.gitignore` only to permit the example. No deployment platform abstraction.

**Checks:** both certificates validate normally; HTTP never serves the password form; canonical redirects and metadata agree. A clean checkout deploys without a tracked storage directory, deleted source files do not survive as stale application code, and rollback preserves current data. Host access, verified contacts, and deployment configuration affect these checks, not unrelated PRs.

## Verification and sign-off

Add focused regression coverage alongside each substantive fix. Node tests cover the actual helpers and production HTTP behavior; use isolated data and synthetic credentials. Browser checks cover editor interactions, callback destinations, calculator state, media, and focus. Do not add a test framework merely to automate a few CSS/editor checks.

The PR1 CI command sequence remains the baseline for later PRs. Before release, repeat only the affected browser flows and the hosting smoke checks. Update each audit finding with the fix reference and its passing evidence; keep unresolved hosting/business items explicit. Production deployment is a separate execution step from this planning update.

Coverage: immediate/hosting **H01, H02, H04, H12**; PR1 **H03, H09, H13, M01, M05, M06, L01, L02**; PR2 **H10, H11**; PR3 **H05, H06, H07, M02**; PR4 **H08**; PR5 **M03, M04, M07, M08, M09, M10**. All 25 findings are assigned.

## Optional follow-up — does not block audit-fix sign-off

- `DESIGN.md`, `UX-CONTRACT.md`, broader design-system work, and a full screen-reader pass.
- Storage interfaces, shared client/server schema metadata, database migration, and durable idempotency. Multiple-process coordination becomes required only if that topology is confirmed and retained.
- XLSX exports, server-side lead pagination, and a separate retention policy.
- Core Web Vitals measurement, client-payload reduction, and wider performance work.
- Changing public sample-content fallback or introducing a publishing/snapshot system: make the business decision first.
- Additional observations from the audit: Maps locale/loading behavior, upload stream limits, session/header hardening, media-cleanup refinements, and a `/login` alias if actually needed.

These remain visible follow-up work; they are not extra acceptance criteria for the 25 numbered fixes.
