import { apartments } from "@/data/mock";
import { localizeHref, locales } from "@/i18n/config";
import { absoluteUrl, apartmentPath } from "@/lib/seo";

// One entry per page per language, each listing all its translations (hreflang).
// Every apartment is included, even reserved and sold ones that the picker hides by default.
export default function sitemap() {
  const lastModified = new Date();

  const pages = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/menziller", changeFrequency: "daily", priority: 0.9 },
    ...apartments.map((apartment) => ({
      path: apartmentPath(apartment),
      changeFrequency: "weekly",
      priority: apartment.status === "sold" ? 0.4 : 0.7,
    })),
    { path: "/qalereya", changeFrequency: "monthly", priority: 0.6 },
    { path: "/elaqe", changeFrequency: "monthly", priority: 0.6 },
  ];

  return pages.flatMap(({ path, ...entry }) => {
    const languages = Object.fromEntries(
      locales.map((code) => [code, absoluteUrl(localizeHref(code, path))]),
    );
    return locales.map((locale) => ({
      url: languages[locale],
      lastModified,
      alternates: { languages },
      ...entry,
    }));
  });
}
