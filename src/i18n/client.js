import { useParams } from "next/navigation";
import { defaultLocale, hasLocale } from "./config";
import { getContent } from "./content";

// Client Components: the [lang] segment comes from the current route.
export function useI18n() {
  const params = useParams();
  const locale = hasLocale(params?.lang) ? params.lang : defaultLocale;
  return { locale, content: getContent(locale) };
}
