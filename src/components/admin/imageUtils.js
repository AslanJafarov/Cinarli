// Reads an uploaded image, scales it down to `maxSize` px on the longest side
// and returns a data URL. WebP keeps transparency (plans) and stays small enough
// for the browser draft; PNG/JPEG is the fallback where WebP encoding is unsupported.
export async function readImageFile(file, maxSize = 1400) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = canvas.toDataURL("image/webp", 0.85);
  if (webp.startsWith("data:image/webp")) return webp;

  return canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.85);
}
