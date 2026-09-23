# Çınarlı Park

Next.js 16.3.5 / React 19 marketing site with AZ, RU and EN content and a password-protected admin panel at `/admin`.

## Local development and checks

Use Node **24** (the version the cPanel app runs; CI uses the same major) and the committed lockfile.

```sh
npm ci
# Copy .env.example to .env.local and set local credentials if admin access is needed.
npm run dev
```

Verification uses Node's built-in test runner, with no added test dependencies:

```sh
npm run lint
npm run build
npm test
```

Build before `npm test`: the HTTP regression starts the production build with temporary runtime credentials. Tests create and remove only their own temporary data directories. They cover phone/CSV/calculator logic, content validation, save conflicts, corrupt files, lead deduplication, body limits, throttling and runtime admin authentication. Browser interaction evidence is recorded with the audit fixes.

## Configuration

See [.env.example](.env.example). Never commit real credentials or server data.

- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`: runtime admin credentials. Generate a long random session secret. Rotating it invalidates existing sessions; changing the password alone does not. Missing credentials disable login.
- `DATA_DIR`: absolute writable persistent path, outside application releases; contains `site.json`, `leads.json` and `uploads/`. Local default is `./storage`. Missing public content retains the existing sample fallback. Invalid stored JSON blocks writes and must be recovered before editing.
- `NEXT_PUBLIC_SITE_URL`: canonical HTTPS origin, currently defaulting to `https://chinarlipark.az`. Confirm the host's preferred hostname and set it **before building**.
- Sales phone and WhatsApp links are edited in the admin panel (Əlaqə → Satış ofisi and Footer). The sample placeholder number from `src/data/mock.js` is never shown publicly, so call/WhatsApp buttons stay hidden until a real number is saved.
- **Under construction ("Tikinti rejimi")**: a switch at the top of the admin panel. While on, `src/proxy.js` answers every public request with the construction page (`src/app/maintenance`, texts editable under Sayt mətnləri → Ümumi) and status 503, so search engines treat it as temporary. A browser with an admin session keeps seeing the real site, which is how changes are checked before reopening; those pages show a red "Sayt bağlıdır" note (`SiteClosedBanner.jsx`, driven by the `cinarli_site_closed` cookie the proxy sets) with a "view as visitor" link (`?view=visitor` shows one page as visitors see it). The flag is `maintenance.json` in `DATA_DIR`, separate from content, and takes effect on the next request. The callback form stays available to visitors.
- `TRUSTED_CLIENT_IP_HEADER`: only set after confirming the reverse proxy overwrites or appends the client address and direct access to Node is blocked. The last address is used. When absent/invalid, lead intake uses one shared bucket rather than trusting user-supplied forwarding headers. Defaults: five attempts/minute, 16 KiB body, 60-second duplicate window for the same phone/source/apartment.

**Serving constraint:** JSON writes and lead limiting coordinate within one Node process. Confirm Passenger runs exactly one serving process, without overlapping writers during restarts, before production activation. Rate counters reset on restart. Retaining multiple processes requires revisiting storage coordination and limiting.

## cPanel / Passenger deployment

The site is a cPanel Node.js app (Setup Node.js App): application root `repositories/Cinarli`, startup file `server.js`, Node 24, production mode. `DATA_DIR` points at `/home/chinrlfh/cinarli-data`, outside the app folder, so deployments never touch saved content, leads or uploads. The admin credentials are environment variables on that screen.

**Deploying (automatic):** push to `main`. GitHub Actions (`.github/workflows/ci.yml`) runs lint, build and tests, then builds the site on GitHub's Linux runner and copies the finished `.next` folder to the server over SSH, checks the server out at the same commit, updates `node_modules`, swaps the build in and restarts Passenger. This needs one repository secret, `DEPLOY_SSH_KEY`: the private half of an SSH key generated and authorized in cPanel → SSH Access → Manage SSH Keys. Without it the deploy job reports "skipped". The build cannot run on the host itself: the account's 2 GB cap kills `next build`.

**Deploying (cPanel button, not recommended):** Git Version Control → Manage → Pull or Deploy → *Deploy HEAD Commit*. `.cpanel.yml` uses the app's own Node environment to update `node_modules` in place, build into `.next-build`, and only after a successful build move it to `.next` (the last good build is kept as `.next-previous`). It then touches `tmp/restart.txt`, which makes Passenger restart the app on the next request. A failed install or build stops before the swap, so the site keeps serving the previous build and all data stays untouched. To roll back the build only, swap `.next` and `.next-previous` back and touch `tmp/restart.txt`.

If the deploy task reports that `npm` or the activate script is not found, the Node environment path differs from `/home/chinrlfh/nodevenv/repositories/Cinarli/24/bin/activate`; copy the exact path shown at the top of the Setup Node.js App edit screen into `.cpanel.yml`.

**Manual alternative** (cPanel → Terminal), the same steps `.cpanel.yml` automates:

```sh
cd ~/repositories/Cinarli && git pull && source ~/nodevenv/repositories/Cinarli/24/bin/activate \
  && npm install --no-audit --no-fund \
  && rm -rf .next-build && NEXT_DIST_DIR=.next-build NEXT_BUILD_CPUS=1 npm run build \
  && rm -rf .next-previous && (test ! -d .next || mv .next .next-previous) && mv .next-build .next \
  && mkdir -p tmp && touch tmp/restart.txt && echo DEPLOYED
```

Two host constraints shaped these steps: the account is capped at 2 GB, so the build must run with one worker (`NEXT_BUILD_CPUS=1`) or it is killed at "Collecting page data"; and the host's glibc is too old for Next's native SWC binary, so the build falls back to the slower WASM one (the warnings about `GLIBC_2.29` are expected).

After each deployment check `/`, `/admin/login` (the password form must render), a login, and that saved content, photos and leads are still there. For code rollback, deploy the previous commit the same way; keep the same `DATA_DIR`. Never restore an old `leads.json` merely to roll back code.

TLS is a host task: renew the certificate/full chain for both hostnames, verify HTTPS, then redirect HTTP and the alternate hostname to the canonical HTTPS origin. Test admin paths and query preservation. Configure renewal and add HSTS only after HTTPS is verified.

## Backup and recovery

With writes stopped, take a timestamped copy of the entire `DATA_DIR` (including uploads). Store backups outside release directories with restricted access. Rehearse restoration to a separate temporary directory and test it with the candidate before relying on a backup.

If a JSON file is corrupt, preserve its bytes and recover from a known-good copy with writes stopped; do not replace it with `[]` or `{}`. Reconcile any leads received since the backup. A stale admin save keeps the draft: export its JSON, reload the latest content, and merge the affected sections before saving again.

[AUDIT.md](AUDIT.md) records the original findings and implementation evidence; [FIX_PLAN.md](FIX_PLAN.md) defines the agreed scope. Production TLS, contact verification, process/proxy settings and a host deployment rehearsal remain external checks.
