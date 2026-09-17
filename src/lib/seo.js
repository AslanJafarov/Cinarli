import { projectStats as baseStats } from "@/data/mock";
import { defaultLocale, localizeHref, locales } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { ordinal, translate } from "@/i18n/format";

export { ordinal };

// Public origin for canonical URLs, the sitemap and link previews.
// Set NEXT_PUBLIC_SITE_URL in production; the fallback is a placeholder until the domain is final.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://cinarli.az"
).replace(/\/+$/, "");

export const absoluteUrl = (path = "/") => new URL(path, `${siteUrl}/`).toString();

const lower = (text = "", locale = defaultLocale) =>
  String(text).toLocaleLowerCase(locale);

// Absolute URL of an unprefixed path ("/menziller") in the given language.
const pageUrl = (locale, path) => absoluteUrl(localizeHref(locale, path));

/** Canonical URL in this language plus hreflang links to every language. */
export function languageAlternates(locale, path) {
  return {
    canonical: localizeHref(locale, path),
    languages: {
      ...Object.fromEntries(locales.map((code) => [code, localizeHref(code, path)])),
      "x-default": path,
    },
  };
}

/** Title, description, canonical/hreflang and link-preview tags for a page. `path` is unprefixed. */
export function pageMetadata({
  locale = defaultLocale,
  title,
  description,
  path,
  imagePath = "/opengraph-image",
  absoluteTitle = false,
}) {
  const { seo, ui } = getContent(locale);
  const fullTitle = absoluteTitle ? title : `${title} | ${seo.siteName}`;
  // A page-level openGraph object replaces the inherited share image, so it's always
  // listed explicitly; apartment pages pass their own generated image.
  const image = {
    url: localizeHref(locale, imagePath),
    width: 1200,
    height: 630,
    alt: seo.siteName,
  };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: languageAlternates(locale, path),
    openGraph: {
      type: "website",
      locale: ui.seo.ogLocale,
      alternateLocale: locales
        .filter((code) => code !== locale)
        .map((code) => getContent(code).ui.seo.ogLocale),
      siteName: seo.siteName,
      url: localizeHref(locale, path),
      title: fullTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.url],
    },
  };
}

export const apartmentPath = (apartment) => `/menziller/${apartment.id}`;

// Pass the apartment from getContent(locale) so its renovation text is already translated.
function apartmentVars(apartment, locale) {
  const { seo, apartmentStatuses } = getContent(locale);
  return {
    siteName: seo.siteName,
    rooms: apartment.rooms,
    area: apartment.area,
    building: apartment.building,
    floor: apartment.floor,
    floorOrdinal: ordinal(apartment.floor),
    unit: apartment.unit,
    balconies: apartment.balconies,
    renovation: lower(apartment.renovation, locale),
    status: lower(apartmentStatuses[apartment.status], locale),
  };
}

export const apartmentTitle = (apartment, locale = defaultLocale) =>
  translate(getContent(locale).ui.seo.apartmentTitle, apartmentVars(apartment, locale));

export const apartmentDescription = (apartment, locale = defaultLocale) =>
  translate(
    getContent(locale).ui.seo.apartmentDescription,
    apartmentVars(apartment, locale),
  );

// ---- Structured data (schema.org), rendered with <JsonLd /> ----

// Language-neutral ids, so every language describes the same entity.
const complexId = () => absoluteUrl("/#complex");
const officeId = () => absoluteUrl("/elaqe#office");

const postalAddress = (locale) => ({
  "@type": "PostalAddress",
  streetAddress: getContent(locale).locationInfo.address.split(",")[0].trim(),
  addressLocality: "Bakı",
  addressCountry: "AZ",
});

const geoCoordinates = (locale) => {
  const { origin } = getContent(locale).locationInfo;
  return { "@type": "GeoCoordinates", latitude: origin.lat, longitude: origin.lng };
};

export function complexJsonLd(locale = defaultLocale) {
  const { seo, advantages } = getContent(locale);
  // Found by its Azerbaijani label; the number itself is the same in every language.
  const units = Number(baseStats.find((stat) => stat.label === "mənzil")?.value);

  return {
    "@type": "ApartmentComplex",
    "@id": complexId(),
    name: seo.siteName,
    description: seo.home.description,
    url: pageUrl(locale, "/"),
    image: pageUrl(locale, "/opengraph-image"),
    address: postalAddress(locale),
    geo: geoCoordinates(locale),
    numberOfAccommodationUnits: Number.isFinite(units)
      ? { "@type": "QuantitativeValue", value: units }
      : undefined,
    amenityFeature: advantages.items.map((item) => ({
      "@type": "LocationFeatureSpecification",
      name: `${item.value} · ${item.label}`,
      value: true,
    })),
  };
}

export function salesOfficeJsonLd(locale = defaultLocale) {
  const { seo, contactPage } = getContent(locale);
  const { office } = contactPage;

  return {
    "@type": "RealEstateAgent",
    "@id": officeId(),
    name: `${seo.siteName} — ${lower(office.label, locale)}`,
    url: pageUrl(locale, "/elaqe"),
    image: pageUrl(locale, "/opengraph-image"),
    telephone: office.phoneHref.replace(/^tel:/, ""),
    address: postalAddress(locale),
    geo: geoCoordinates(locale),
    areaServed: "Bakı",
  };
}

export function apartmentJsonLd(apartment, locale = defaultLocale) {
  const { seo } = getContent(locale);
  const localizedPath = localizeHref(locale, apartmentPath(apartment));

  return {
    "@type": "Apartment",
    "@id": absoluteUrl(`${apartmentPath(apartment)}#apartment`),
    name: apartmentTitle(apartment, locale),
    description: apartmentDescription(apartment, locale),
    url: absoluteUrl(localizedPath),
    image: absoluteUrl(`${localizedPath}/opengraph-image`),
    numberOfRooms: apartment.rooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: Number(apartment.area),
      unitCode: "MTK",
    },
    floorLevel: String(apartment.floor),
    containedInPlace: {
      "@type": "ApartmentComplex",
      "@id": complexId(),
      name: seo.siteName,
      address: postalAddress(locale),
    },
  };
}

export function apartmentListJsonLd(locale = defaultLocale) {
  const { seo, apartments } = getContent(locale);

  return {
    "@type": "ItemList",
    name: seo.apartments.title,
    itemListElement: apartments.map((apartment, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: pageUrl(locale, apartmentPath(apartment)),
      name: apartmentTitle(apartment, locale),
    })),
  };
}

/** `items`: [{ name, path }] from the home page down to the current page (paths already localized). */
export function breadcrumbJsonLd(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** `photos`: gallery photos with their imported `image` (static import: src, width, height). */
export function imageGalleryJsonLd(locale = defaultLocale, photos = []) {
  const { seo } = getContent(locale);

  return {
    "@type": "ImageGallery",
    name: seo.gallery.title,
    description: seo.gallery.description,
    url: pageUrl(locale, "/qalereya"),
    about: { "@id": complexId() },
    image: photos.map((photo) => ({
      "@type": "ImageObject",
      contentUrl: absoluteUrl(photo.image.src),
      width: photo.image.width,
      height: photo.image.height,
      caption: photo.alt,
    })),
  };
}

export function faqJsonLd(faqs) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
