// Scales an image down to `maxSize` px on the longest side in the browser (smaller, faster uploads),
// then sends it to the server, which stores it and returns { src, width, height }.
async function shrinkImage(file, maxSize) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WebP keeps transparency (plans); the server re-encodes whatever arrives.
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
  return blob ?? file;
}

export async function uploadImage(file, maxSize = 2000) {
  const body = new FormData();
  body.append("file", await shrinkImage(file, maxSize));

  const response = await fetch("/api/admin/upload", { method: "POST", body });
  if (!response.ok) throw new Error("Upload failed");
  return response.json();
}
