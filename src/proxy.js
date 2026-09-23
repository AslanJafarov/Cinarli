import { NextResponse } from "next/server";
import { defaultLocale, locales } from "./i18n/config";
import { isMaintenanceOn } from "./lib/maintenance";
import { ADMIN_COOKIE, verifySession } from "./lib/session";

// Generated icons and share images live under [lang], so Next links them as /az/icon etc.
const METADATA_ROUTE = /\/(icon|apple-icon|opengraph-image|twitter-image)(\/|$)/;

// The "under construction" page lives at /maintenance/<lang> (src/app/maintenance).
const MAINTENANCE_SEGMENT = "maintenance";

// Azerbaijani lives at unprefixed URLs (/menziller); /ru/… and /en/… are served as-is.
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const [, firstSegment] = pathname.split("/");
  const isAdmin = () => verifySession(request.cookies.get(ADMIN_COOKIE)?.value);

  // The construction page itself: visible while the site is closed, and to a logged-in admin
  // at any time (the admin panel previews it). Otherwise it just sends people home.
  if (firstSegment === MAINTENANCE_SEGMENT) {
    if (isMaintenanceOn() || isAdmin()) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Under construction: visitors get the construction page in their language with a 503, so
  // search engines treat it as temporary. An admin session sees the real site (same browser
  // as the panel), which is how changes are checked before reopening. Icons and share images
  // keep working so the construction page and the admin preview render correctly.
  if (isMaintenanceOn() && !METADATA_ROUTE.test(pathname) && !isAdmin()) {
    const locale = locales.includes(firstSegment) ? firstSegment : defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${MAINTENANCE_SEGMENT}/${locale}`;
    url.search = "";
    return NextResponse.rewrite(url, {
      status: 503,
      headers: { "Retry-After": "3600", "Cache-Control": "no-store" },
    });
  }

  // /az/… pages are the same as /… — keep one canonical URL (image routes are served directly).
  if (firstSegment === defaultLocale && !METADATA_ROUTE.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (locales.includes(firstSegment)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, the admin panel, Next internals and files with an extension.
  matcher: ["/((?!api|admin|_next|.*\\..*).*)"],
};
