import * as baseData from "../data/mock";
import { defaultLocale, hasLocale } from "./config";
import { ui as azUi } from "./translations/az";
import en from "./translations/en";
import ru from "./translations/ru";

// src/data/mock.js is the Azerbaijani source (and what the admin panel edits).
// Russian and English only list the text they replace; everything else
// (ids, numbers, links, images) falls through from the Azerbaijani data.
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

const cache = new Map();

export function getContent(locale) {
  const key = hasLocale(locale) ? locale : defaultLocale;

  if (!cache.has(key)) {
    const base = { ...baseData, ui: azUi };

    if (key === defaultLocale) {
      cache.set(key, base);
    } else {
      const { apartmentTerms, ...overrides } = translations[key];
      const merged = mergeDeep(base, overrides);
      cache.set(key, {
        ...merged,
        apartments: translateApartments(merged.apartments, apartmentTerms),
      });
    }
  }

  return cache.get(key);
}
