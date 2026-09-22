import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import net from "node:net";
import { spawn } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

test("production build supports runtime-only admin credentials and bounded lead intake", { timeout: 120_000 }, async (t) => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const manifest = JSON.parse(await fs.readFile(path.join(root, ".next/prerender-manifest.json"), "utf8"));
  assert.equal(manifest.routes["/admin/login"], undefined, "Login must not be statically frozen at build time");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "cinarli-http-test-"));
  const listener = net.createServer();
  await new Promise((resolve) => listener.listen(0, "127.0.0.1", resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const secret = randomBytes(32).toString("hex");
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "localhost", "-p", String(port)], {
    cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production", DATA_DIR: directory,
      ADMIN_USERNAME: "test-admin", ADMIN_PASSWORD: randomBytes(24).toString("hex"),
      ADMIN_SESSION_SECRET: secret, TRUSTED_CLIENT_IP_HEADER: "x-test-client-ip",
      NEXT_TELEMETRY_DISABLED: "1" },
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  const stopped = new Promise((resolve) => child.once("exit", resolve));
  t.after(async () => {
    child.kill();
    await stopped;
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep));
    assert.ok(path.basename(directory).startsWith("cinarli-http-test-"));
    await fs.rm(directory, { recursive: true, force: true });
  });
  const origin = "http://localhost:" + port;
  let ready = false;
  for (let i = 0; i < 120; i++) {
    if (child.exitCode !== null) throw new Error(output);
    try {
      const response = await fetch(origin + "/admin/login");
      const html = await response.text();
      if (response.status === 200) {
        assert.match(html, /name="password"/);
        ready = true;
        break;
      }
    } catch { /* Wait for Next to listen. */ }
    await delay(250);
  }
  assert.ok(ready, output);
  // NextURL normalizes loopback URLs to localhost; match the server hostname for rewrites.
  assert.equal((await fetch(origin + "/")).status, 200);
  const expires = String(Date.now() + 60_000);
  const signed = createHmac("sha256", secret).update(expires).digest("base64url");
  const cookie = "cinarli_admin=" + expires + "." + signed;
  const admin = await fetch(origin + "/admin", { headers: { cookie } });
  assert.equal(admin.status, 200);
  assert.match(await admin.text(), /Admin panel/);
  for (const invalidCookie of ["", cookie + "x"]) {
    const denied = await fetch(origin + "/admin", { redirect: "manual", headers: { cookie: invalidCookie } });
    assert.equal(denied.status, 307);
    assert.match(denied.headers.get("location"), /\/admin\/login/);
  }
  const post = (body, ip) => fetch(origin + "/api/leads", {
    method: "POST", headers: { "content-type": "application/json", ...(ip ? { "x-test-client-ip": ip } : {}) }, body,
  });
  const lead = JSON.stringify({ phone: "+994501234567", source: "apartment", apartmentId: "A" });
  const duplicates = await Promise.all([post(lead, "192.0.2.1"), post(lead, "192.0.2.2")]);
  assert.ok(duplicates.every((response) => response.status === 201));
  const stored = JSON.parse(await fs.readFile(path.join(directory, "leads.json"), "utf8"));
  assert.equal(stored.length, 1);
  assert.equal((await post("x".repeat(17000), "192.0.2.3")).status, 413);
  assert.equal((await post("{", "192.0.2.4")).status, 400);
  assert.equal((await post(JSON.stringify({ phone: "+9945012345678" }), "192.0.2.5")).status, 422);
  const burst = [];
  for (let i = 0; i < 6; i++) burst.push(await post(lead, "192.0.2.6"));
  assert.equal(burst.at(-1).status, 429);
  assert.ok(Number(burst.at(-1).headers.get("retry-after")) > 0);
  // Missing trusted identity uses a site-wide abuse ceiling, not the five-attempt client limit.
  for (let i = 0; i < 6; i++) assert.equal((await post(lead)).status, 201);
});
