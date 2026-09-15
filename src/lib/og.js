import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Helpers for generated images (share previews and app icons).
// Paths are spelled out under src/assets so the bundler traces only that folder,
// not the whole project, into the server output.

// Noto Sans covers the Azerbaijani letters (ə, ş, ğ, ı, ö, ü, ç) used in the images.
export async function ogFonts() {
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "src", "assets", "fonts", "NotoSans-Regular.ttf")),
    readFile(join(process.cwd(), "src", "assets", "fonts", "NotoSans-Bold.ttf")),
  ]);
  return [
    { name: "Noto Sans", data: regular, weight: 400, style: "normal" },
    { name: "Noto Sans", data: bold, weight: 700, style: "normal" },
  ];
}

/**
 * Local asset as a data URI for <img> inside ImageResponse.
 * `assetPath` is relative to src/assets (a leading "src/assets/" is accepted too).
 * Pass `width` to downscale large sources first, which keeps rendering fast.
 */
export async function assetDataUri(assetPath, mimeType, { width } = {}) {
  const relativePath = assetPath.replace(/^src\/assets\//, "");
  let data = await readFile(join(process.cwd(), "src", "assets", relativePath));

  if (width) {
    const resized = sharp(data).resize({ width, withoutEnlargement: true });
    data =
      mimeType === "image/png"
        ? await resized.png().toBuffer()
        : await resized.jpeg({ quality: 85 }).toBuffer();
  }

  return `data:${mimeType};base64,${data.toString("base64")}`;
}

/**
 * ImageResponse only renders PNG, which is heavy for photos (hundreds of KB).
 * Messaging apps such as WhatsApp may skip large previews, so share images are sent as JPEG.
 */
export async function toJpegResponse(imageResponse, { quality = 82 } = {}) {
  const png = Buffer.from(await imageResponse.arrayBuffer());
  const jpeg = await sharp(png).jpeg({ quality, mozjpeg: true }).toBuffer();

  const headers = new Headers(imageResponse.headers);
  headers.set("Content-Type", "image/jpeg");
  headers.set("Content-Length", String(jpeg.length));

  return new Response(jpeg, { status: imageResponse.status, headers });
}
