import { NextResponse } from "next/server";
import { defaultLocale, locales } from "./i18n/config";

// Generated icons and share images live under [lang], so Next links them as /az/icon etc.
const METADATA_ROUTE = /\/(icon|apple-icon|opengraph-image|twitter-image)(\/|$)/;

// Azerbaijani lives at unprefixed URLs (/menziller); /ru/… and /en/… are served as-is.
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const [, firstSegment] = pathname.split("/");

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
