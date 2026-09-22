import * as defaults from "../data/mock.js";

const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const fail = (path, reason) => { throw new Error(`${path}: ${reason}`); };
const numeric = (value, path, min = 0, integer = false) => {
  if (value === "" || value === null || !["number", "string"].includes(typeof value) ||
      !Number.isFinite(Number(value)) || Number(value) < min || (integer && !Number.isInteger(Number(value)))) {
    fail(path, "düzgün rəqəm daxil edin.");
  }
};

function image(value, path, nullable = false) {
  if (nullable && value === null) return;
  if (!object(value)) fail(path, "şəkil məlumatı düzgün deyil.");
  if (value.src !== undefined) {
    if (typeof value.src !== "string" || !/^\/media\/[a-f0-9-]{36}\.webp$/.test(value.src)) fail(path, "şəkil ünvanı düzgün deyil.");
    numeric(value.width, path + ".width", 1, true);
    numeric(value.height, path + ".height", 1, true);
  } else if (typeof value.key !== "string" || !value.key.trim()) {
    fail(path, "şəkil açarı yoxdur.");
  }
}

// Validate the existing data shapes; arrays may be empty and optional sample fields stay optional.
function shape(value, examples, path) {
  if (/^siteImages\./.test(path)) {
    if (value === "built-in" || value === null) return;
    return image(value, path);
  }
  if (/\.(cover|planImage)$/.test(path)) return image(value, path, true);
  const sample = examples[0];
  if (Array.isArray(sample)) {
    if (!Array.isArray(value)) fail(path, "siyahı olmalıdır.");
    const items = examples.flat();
    value.forEach((item, index) => {
      if (items.length) shape(item, items, `${path}[${index}]`);
    });
    return;
  }
  if (object(sample)) {
    if (!object(value)) fail(path, "obyekt olmalıdır.");
    const templates = examples.filter(object);
    const keys = new Set(templates.flatMap(Object.keys));
    for (const key of keys) {
      const fieldPath = `${path}.${key}`;
      const optional = key === "plan" || key === "position" || templates.some((item) => !(key in item));
      if (!(key in value)) {
        if (!optional) fail(fieldPath, "tələb olunur.");
      } else {
        shape(value[key], templates.filter((item) => key in item).map((item) => item[key]), fieldPath);
      }
    }
    if (Object.hasOwn(value, "src")) image(value, path);
    return;
  }
  if (typeof value !== typeof sample || (typeof value === "number" && !Number.isFinite(value))) {
    fail(path, `${typeof sample} tipində olmalıdır.`);
  }
  if (typeof value === "string" && /(?:href|Href)$/.test(path) && value &&
      !/^(\/(?!\/)|#|https?:\/\/|tel:\+?[\d\s()-]+$|mailto:)/.test(value)) {
    fail(path, "keçid düzgün deyil.");
  }
}

function ids(items, path) {
  const seen = new Set();
  for (const item of items) {
    if (typeof item.id !== "string" || !/^[\p{L}\p{N}_-]+$/u.test(item.id) || seen.has(item.id)) {
      fail(path, "ünvanlar boş olmamalı, təkrarlanmamalı və yalnız hərf, rəqəm, _ və - işarələrindən ibarət olmalıdır.");
    }
    seen.add(item.id);
  }
}

export function validateContent(data, translations = {}) {
  if (!object(data)) fail("data", "obyekt olmalıdır.");
  for (const [key, template] of Object.entries(defaults)) {
    if (!(key in data)) fail(key, "bölmə yoxdur.");
    shape(data[key], [template], key);
  }
  ids(data.apartments, "apartments");
  ids(data.news, "news");
  for (const [index, apartment] of data.apartments.entries()) {
    const path = `apartments[${index}]`;
    for (const key of ["rooms", "floor", "balconies"]) numeric(apartment[key], path + "." + key, key === "rooms" ? 1 : 0, true);
    numeric(apartment.area, path + ".area", 0.01);
    if (!Object.hasOwn(data.apartmentStatuses, apartment.status)) fail(path + ".status", "status düzgün deyil.");
    if (apartment.planImage !== undefined) image(apartment.planImage, path + ".planImage", true);
    if (apartment.photos !== undefined) {
      if (!Array.isArray(apartment.photos)) fail(path + ".photos", "siyahı olmalıdır.");
      apartment.photos.forEach((photo, i) => {
        image(photo, path + ".photos[" + i + "]");
        if (photo.alt !== undefined && typeof photo.alt !== "string") fail(path, "şəkil mətni düzgün deyil.");
      });
    }
    apartment.layout.forEach((room, i) => numeric(room.area, path + ".layout[" + i + "].area", 0.01));
  }
  for (const filter of data.apartmentFilters) {
    if (!["match", "range"].includes(filter.type) || filter.options.length === 0 ||
        !filter.options.some((option) => option.value === filter.defaultValue)) fail("apartmentFilters", "filtr seçimlərini yoxlayın.");
    for (const option of filter.options) {
      if (option.min !== undefined) numeric(option.min, "apartmentFilters.min");
      if (option.max !== undefined) numeric(option.max, "apartmentFilters.max");
      if (option.min !== undefined && option.max !== undefined && option.min > option.max) fail("apartmentFilters", "minimum maksimumdan böyükdür.");
    }
  }
  const payment = data.paymentCalculator;
  numeric(payment.price, "paymentCalculator.price", 1);
  numeric(payment.downPayment, "paymentCalculator.downPayment");
  numeric(payment.months, "paymentCalculator.months", 1, true);
  if (payment.downPayment > payment.price) fail("paymentCalculator.downPayment", "mənzil dəyərindən böyükdür.");
  if (!object(translations)) fail("translations", "obyekt olmalıdır.");
  for (const [locale, dictionary] of Object.entries(translations)) {
    if (!["ru", "en"].includes(locale) || !object(dictionary) || Object.values(dictionary).some((text) => typeof text !== "string")) {
      fail("translations", "RU/EN tərcümələri mətn olmalıdır.");
    }
  }
}
