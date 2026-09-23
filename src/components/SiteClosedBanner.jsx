"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Shown only in an admin's browser while "Tikinti rejimi" is on: src/proxy.js sets the
// cinarli_site_closed cookie when it lets an admin session through to the real site, and
// removes it once the site is open again. Visitors never get the cookie, so they never see this.
// The panel is Azerbaijani-only, so this admin-only note is too.
const COOKIE = "cinarli_site_closed=1";

export default function SiteClosedBanner() {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    // Read after mount: the page is static, so the server never knows who is looking.
    const check = () => setClosed(document.cookie.split("; ").includes(COOKIE));
    check();
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
  }, []);
  if (!closed) return null;

  const visitorHref = `${window.location.pathname}?view=visitor`;
  return (
    <aside
      role="status"
      className="fixed bottom-4 left-4 z-[90] max-w-[min(92vw,420px)] rounded-2xl bg-[#9b2f22] px-4 py-3 text-sm text-white shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
    >
      <p className="font-semibold">Sayt ziyarətçilər üçün bağlıdır (tikinti rejimi).</p>
      <p className="mt-1 text-white/85">
        Bu səhifələri yalnız siz görürsünüz; ziyarətçilər “Sayt hazırlanır” səhifəsini görür.
      </p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-semibold underline underline-offset-4">
        {/* Plain anchor on purpose: the proxy must see a full request to apply the visitor view. */}
        <a href={visitorHref}>Ziyarətçi kimi bax</a>
        <Link href="/admin">Admin panel</Link>
      </p>
    </aside>
  );
}
