import { photoImage } from "./galleryPhotos";

const DATE_LOCALES = { az: "az-AZ", ru: "ru-RU", en: "en-GB" };

/** Newest first; items without a title or address are left out. */
export const publishedNews = (news = []) =>
  news
    .filter((item) => item?.id && item?.title)
    .toSorted((a, b) => String(b.date).localeCompare(String(a.date)));

export function formatNewsDate(date, locale) {
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString(DATE_LOCALES[locale] ?? DATE_LOCALES.az, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Paragraphs are separated by an empty line in the admin panel.
export const newsParagraphs = (body = "") =>
  String(body)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export const newsCover = (item) => (item?.cover ? photoImage(item.cover) : null);
