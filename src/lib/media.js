import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { MEDIA_NAME, MEDIA_PREFIX, uploadsDir } from "./store";

// Server-only. Reads a file uploaded in the admin panel from its public URL ("/media/<name>").
export async function readUpload(src) {
  if (typeof src !== "string" || !src.startsWith(MEDIA_PREFIX)) return null;
  const name = src.slice(MEDIA_PREFIX.length);
  if (!MEDIA_NAME.test(name)) return null;
  try {
    return await fs.promises.readFile(path.join(uploadsDir, name));
  } catch {
    return null;
  }
}

// Link preview images (next/og) can't draw WebP, so uploads are converted to JPEG there.
export async function uploadJpegDataUri(src) {
  const file = await readUpload(src);
  if (!file) return null;
  const jpeg = await sharp(file).flatten({ background: "#ffffff" }).jpeg({ quality: 85 }).toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}
