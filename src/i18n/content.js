import * as mockData from "../data/mock";
import { getSiteData } from "../lib/store";
import { withPublicContacts } from "../lib/publicContacts";
import { pairTexts, translateValue } from "../lib/translatable";
import { defaultLocale, hasLocale } from "./config";
import { ui as azUi } from "./translations/az";
import en from "./translations/en";
import ru from "./translations/ru";

// Server-only. The Azerbaijani source is src/data/mock.js or the admin panel's saved data
// (see src/lib/store.js). Russian and English files only list the text they replace, by position
// in mock.js; everything else (ids, numbers, links, images) falls through from the Azerbaijani data.
// Saved data is translated by text instead (src/lib/translatable.js), so admin edits can't
// shift translations onto the wrong items.
const translations = { ru, en };

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// Objects merge by key, arrays by index; `undefined`/`null`/`{}` keep the base value.
function mergeDeep(base, override) {
  if (override === undefined || override === null) return base;

  if (Array.isArray(base) && Array.isArray(override)) {
    return base.map((item, index) => mergeDeep(item, override[index]));
  }

  if (isPlainObject(base) && isPlainObject(override)) {
    const result = { ...base };
    for (const [key, value] of Object.entries(override)) {
      result[key] = mergeDeep(base[key], value);
    }
    return result;
  }

  return override;
}

// Flat-level phrases ("1 balkon", "Yataq otağı", …) are translated by glossary,
// so newly added apartments pick up translations without per-apartment entries.
function translateApartments(apartments, terms = {}) {
  const term = (value) => terms[value] ?? value;
  return apartments.map((apartment) => ({
    ...apartment,
    renovation: term(apartment.renovation),
    highlights: (apartment.highlights ?? []).map(term),
    layout: (apartment.layout ?? []).map((room) => ({
      ...room,
      name: term(room.name),
    })),
  }));
}

const seeds = new Map();

/**
 * Translations of the sample texts as { "Azerbaijani text": "translation" }: the starting
 * dictionary for saved data, which the admin panel's translations extend and override.
 */
export function translationSeed(locale) {
  if (!seeds.has(locale)) {
    const { apartmentTerms = {}, ui, ...overrides } = translations[locale];
    const data = { ...mockData };
    seeds.set(locale, { ...apartmentTerms, ...pairTexts(data, mergeDeep(data, overrides)) });
  }
  return seeds.get(locale);
}

// Keyed by the data object, so a new save builds fresh content.
const cache = new WeakMap();

function localize({ mode, data, translations: saved }, locale) {
  const base = { ...data, ui: azUi };
  if (locale === defaultLocale) return base;

  const { apartmentTerms, ui, ...overrides } = translations[locale];
  const localizedUi = mergeDeep(azUi, ui);

  if (mode === "mock") {
    const merged = mergeDeep(data, overrides);
    return {
      ...merged,
      ui: localizedUi,
      apartments: translateApartments(merged.apartments, apartmentTerms),
    };
  }

  const dictionary = { ...translationSeed(locale), ...saved?.[locale] };
  return { ...translateValue(data, dictionary), ui: localizedUi };
}
export function getContent(locale) {
  const key = hasLocale(locale) ? locale : defaultLocale;
  const siteData = getSiteData();

  if (!cache.has(siteData.data)) cache.set(siteData.data, new Map());
  const byLocale = cache.get(siteData.data);
  if (!byLocale.has(key)) byLocale.set(key, withPublicContacts(localize(siteData, key)));
  return byLocale.get(key);
}
