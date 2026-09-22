import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import * as mockData from "../data/mock.js";
import { cleanDictionary } from "./translatable.js";
import { validateContent } from "./contentValidation.js";

// Server-only: everything the admin panel saves lives in one folder outside the app code,
// so deploys don't overwrite it. Set DATA_DIR on the server to keep it somewhere else.
// The ignore comment keeps the build from bundling the whole project because of this runtime path.
export const dataDir = path.resolve(
  /*turbopackIgnore: true*/ process.env.DATA_DIR || path.join(process.cwd(), "storage"),
);
const storeFile = path.join(dataDir, "site.json");
export const uploadsDir = path.join(dataDir, "uploads");

// Uploaded images are served by src/app/media/[name]/route.js under this prefix.
export const MEDIA_PREFIX = "/media/";
export const MEDIA_NAME = /^[a-f0-9-]{36}\.webp$/;

/**
 * mode "mock": the site shows src/data/mock.js, as before the admin panel saved anything.
 * mode "production": the site shows the saved data. Apartments start empty; every other section
 * the admin hasn't saved yet (texts, section photos, gallery, news) falls back to mock.js.
 */
const emptyStore = { mode: "mock", data: {}, translations: {}, savedAt: null, revision: 0 };

let cached = { mtimeMs: -1, store: emptyStore };

export function readStore({ strict = false } = {}) {
  let mtimeMs;
  try {
    mtimeMs = fs.statSync(storeFile).mtimeMs;
  } catch (error) {
    if (strict && error.code !== "ENOENT") throw error;
    return emptyStore;
  }
  if (strict || mtimeMs !== cached.mtimeMs) {
    try {
      const parsed = JSON.parse(fs.readFileSync(storeFile, "utf8"));
      const object = (value) => value && typeof value === "object" && !Array.isArray(value);
      if (!object(parsed) || !["mock", "production"].includes(parsed.mode) ||
          !object(parsed.data) || (parsed.translations !== undefined && !object(parsed.translations)) ||
          !Number.isSafeInteger(parsed.revision ?? 0) || (parsed.revision ?? 0) < 0) {
        throw new Error("site.json has an invalid shape");
      }
      cached = {
        mtimeMs,
        store: {
          mode: parsed.mode === "production" ? "production" : "mock",
          data: parsed.data && typeof parsed.data === "object" ? parsed.data : {},
          // { ru: { "Azerbaijani text": "translation" }, en: { … } }; see src/lib/translatable.js.
          translations: parsed.translations && typeof parsed.translations === "object"
            ? parsed.translations
            : {},
          savedAt: parsed.savedAt ?? null,
          revision: parsed.revision ?? 0,
        },
      };
    } catch (error) {
      if (strict) throw error;
      // A half-written or hand-edited file: keep serving the last good copy.
      return cached.store;
    }
  }
  return cached.store;
}

async function writeStore(store) {
  await fs.promises.mkdir(dataDir, { recursive: true });
  // Write to a temp file first, so a crash never leaves a broken site.json.
  const temp = `${storeFile}.${randomUUID()}.tmp`;
  await fs.promises.writeFile(temp, JSON.stringify(store, null, 2));
  await fs.promises.rename(temp, storeFile);
  cached = { mtimeMs: -1, store };
}

// Shared by compiled route/action modules in this Node process. The host must run one writer.
const writes = globalThis[Symbol.for("cinarli.siteWrites")] ??= { queue: Promise.resolve() };
function transaction(expectedRevision, change) {
  const run = writes.queue.then(async () => {
    const store = readStore({ strict: true });
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision !== store.revision) {
      throw new Error("Məlumatlar başqa pəncərədə dəyişib. JSON ixrac ilə qaralamanı saxlayın, səhifəni yeniləyin və dəyişiklikləri birləşdirin.");
    }
    const next = { ...change(store), revision: store.revision + 1 };
    validateContent(productionData(next.data), next.translations);
    await writeStore(next);
    // Cleanup failure must not turn a committed save into a reported failure.
    await removeUnusedUploads(next.data).catch(() => console.error("[storage] upload cleanup failed"));
    return next;
  });
  writes.queue = run.catch(() => {});
  return run;
}

// Production data with empty apartments; only known sections are kept.
export function productionData(saved = {}) {
  const data = { ...mockData, apartments: [] };
  for (const key of Object.keys(mockData)) {
    if (key in saved) data[key] = saved[key];
  }
  return data;
}

const mockSiteData = { mode: "mock", data: mockData, translations: {} };
// One object per saved file, so callers can cache what they build from it.
const siteDataByStore = new WeakMap();

/** The data the public site renders, plus the mode it came from. */
export function getSiteData() {
  const store = readStore();
  if (store.mode !== "production") return mockSiteData;
  if (!siteDataByStore.has(store)) {
    siteDataByStore.set(store, {
      mode: "production",
      data: productionData(store.data),
      translations: store.translations,
    });
  }
  return siteDataByStore.get(store);
}

export async function saveData(data, translations = {}, expectedRevision) {
  // transaction() validates the proposed content once, under the write lock.
  const proposed = productionData(data);
  return transaction(expectedRevision, (store) => ({
    ...store,
    data: proposed,
    translations: {
      ru: cleanDictionary(translations.ru),
      en: cleanDictionary(translations.en),
    },
    savedAt: new Date().toISOString(),
  }));
}

export async function saveMode(mode, expectedRevision) {
  if (!["production", "mock"].includes(mode)) throw new Error("Rejim düzgün deyil.");
  return transaction(expectedRevision, (store) => ({ ...store, mode }));
}

/** Re-encodes an uploaded image as WebP (also strips metadata) and stores it. */
export async function saveUpload(buffer, maxSize = 2000) {
  const { data, info } = await sharp(buffer)
    .rotate()
    .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer({ resolveWithObject: true });

  const name = `${randomUUID()}.webp`;
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadsDir, name), data);
  return { src: `${MEDIA_PREFIX}${name}`, width: info.width, height: info.height };
}

// Deletes uploads the saved data no longer points to. Recent files are kept: they may belong to
// changes that are still being edited and haven't been saved yet.
async function removeUnusedUploads(data) {
  const json = JSON.stringify(data);
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  let names;
  try {
    names = await fs.promises.readdir(uploadsDir);
  } catch {
    return;
  }
  await Promise.all(
    names
      .filter((name) => MEDIA_NAME.test(name) && !json.includes(`${MEDIA_PREFIX}${name}`))
      .map(async (name) => {
        const file = path.join(uploadsDir, name);
        const { mtimeMs } = await fs.promises.stat(file);
        if (mtimeMs < dayAgo) await fs.promises.unlink(file);
      }),
  );
}
