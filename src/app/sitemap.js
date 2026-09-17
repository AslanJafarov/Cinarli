import { getContent } from "@/i18n/content";
import { publishedNews } from "@/lib/news";
import { localizeHref, locales } from "@/i18n/config";
import { absoluteUrl, apartmentPath } from "@/lib/seo";

// One entry per page per language, each listing all its translations (hreflang).
// Every apartment is included, even reserved and sold ones that the picker hides by default.
// Rebuilt with the pages when the admin panel saves; see src/app/[lang]/layout.jsx.
export const revalidate = 60;

export default function sitemap() {
  const lastModified = new Date();
  const { apartments, news } = getContent("az");

  const pages = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/menziller", changeFrequency: "daily", priority: 0.9 },
    ...apartments.map((apartment) => ({
      path: apartmentPath(apartment),
      changeFrequency: "weekly",
      priority: apartment.status === "sold" ? 0.4 : 0.7,
    })),
    { path: "/qalereya", changeFrequency: "monthly", priority: 0.6 },
    { path: "/xeberler", changeFrequency: "weekly", priority: 0.6 },
    ...publishedNews(news).map((item) => ({
      path: `/xeberler/${item.id}`,
      changeFrequency: "monthly",
      priority: 0.5,
    })),
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
