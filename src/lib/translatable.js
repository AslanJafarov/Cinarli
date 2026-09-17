// Translations of admin-editable content are keyed by the Azerbaijani text itself
// ({ "Azerbaijani text": "translation" }), not by position. Reordering, adding or deleting
// items therefore never pairs a text with the wrong translation; a text without a
// translation is shown in Azerbaijani. Used by the server (rendering) and the admin panel.

// Identifiers, links and settings: never translated, never listed for translation.
const SKIP_KEYS = new Set([
  "id",
  "key",
  "href",
  "phoneHref",
  "whatsappHref",
  "field",
  "type",
  "style",
  "position",
  "src",
  "category",
  "status",
  "plan",
  "defaultValue",
  "unit",
  "building",
  "types",
]);

const hasLetters = (text) => /\p{L}/u.test(text);
const isLink = (text) => /^(https?:|tel:|mailto:|\/|#)/.test(text);

function skipped(key, path) {
  if (SKIP_KEYS.has(key) || path[0] === "siteImages") return true;
  // Filter option values are matched against apartment fields, so they must stay as they are.
  return key === "value" && path[0] === "apartmentFilters";
}

export function isTranslatable(text, key, path = []) {
  return (
    typeof text === "string" && text.trim() !== "" && hasLetters(text) && !isLink(text) && !skipped(key, path)
  );
}

/** Copy of `value` with every translatable text replaced by its entry in `dictionary`. */
export function translateValue(value, dictionary, key = "", path = []) {
  if (typeof value === "string") {
    const translated = isTranslatable(value, key, path) ? dictionary[value] : undefined;
    return typeof translated === "string" && translated.trim() ? translated : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => translateValue(item, dictionary, key, path));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([innerKey, inner]) => [
        innerKey,
        translateValue(inner, dictionary, innerKey, [...path, innerKey]),
      ]),
    );
  }
  return value;
}

/** Every translatable text in `data`, with the sections it appears in (in order of appearance). */
export function collectTexts(data) {
  const texts = new Map();
  const walk = (value, section, key, path) => {
    if (typeof value === "string") {
      if (!isTranslatable(value, key, path)) return;
      if (!texts.has(value)) texts.set(value, new Set());
      texts.get(value).add(section);
    } else if (Array.isArray(value)) {
      value.forEach((item) => walk(item, section, key, path));
    } else if (value && typeof value === "object") {
      for (const [innerKey, inner] of Object.entries(value)) {
        walk(inner, section, innerKey, [...path, innerKey]);
      }
    }
  };
  for (const [section, value] of Object.entries(data)) walk(value, section, section, [section]);
  return texts;
}

/**
 * Builds a dictionary from two copies of the same content: Azerbaijani and translated
 * (as produced by the position-based overrides in src/i18n/translations).
 */
export function pairTexts(source, translated, dictionary = {}, key = "", path = []) {
  if (typeof source === "string") {
    if (
      typeof translated === "string" &&
      translated !== source &&
      isTranslatable(source, key, path) &&
      !(source in dictionary)
    ) {
      dictionary[source] = translated;
    }
  } else if (Array.isArray(source) && Array.isArray(translated)) {
    source.forEach((item, index) => pairTexts(item, translated[index], dictionary, key, path));
  } else if (source && typeof source === "object" && translated && typeof translated === "object") {
    for (const [innerKey, inner] of Object.entries(source)) {
      pairTexts(inner, translated[innerKey], dictionary, innerKey, [...path, innerKey]);
    }
  }
  return dictionary;
}

/** Keeps only string → non-empty string entries (used when saving). */
export function cleanDictionary(dictionary) {
  if (!dictionary || typeof dictionary !== "object") return {};
  return Object.fromEntries(
    Object.entries(dictionary).filter(
      ([source, text]) => typeof source === "string" && typeof text === "string" && text.trim(),
    ),
  );
}
