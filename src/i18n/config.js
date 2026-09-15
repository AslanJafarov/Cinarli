export const locales = ["az", "ru", "en"];
export const defaultLocale = "az";

export const localeNames = {
  az: "Azərbaycanca",
  ru: "Русский",
  en: "English",
};

export const hasLocale = (value) => locales.includes(value);

// "/ru/menziller" -> "/menziller", "/ru" -> "/"; unprefixed paths are returned unchanged.
export function stripLocale(pathname = "/") {
  const [, first, ...rest] = pathname.split("/");
  if (!hasLocale(first)) return pathname || "/";
  return `/${rest.join("/")}`;
}

// Adds the language prefix to internal links. Azerbaijani (the default) stays unprefixed;
// tel:, https: and same-page "#hash" links are returned as-is.
export function localizeHref(locale, href) {
  if (typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) {
    return href;
  }
  if (locale === defaultLocale) return href;

  const [path, hash] = href.split("#");
  const localizedPath = path === "/" ? `/${locale}` : `/${locale}${path}`;
  return hash ? `${localizedPath}#${hash}` : localizedPath;
}
