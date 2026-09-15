import { lang } from "next/root-params";
import { defaultLocale, hasLocale } from "./config";
import { getContent } from "./content";

// Server Components: reads the [lang] root segment, no prop drilling needed.
export async function getI18n() {
  const value = await lang();
  const locale = hasLocale(value) ? value : defaultLocale;
  return { locale, content: getContent(locale) };
}
