export class BodyTooLarge extends Error {}

export async function readJsonBody(request, maxBytes = 16 * 1024) {
  if (Number(request.headers.get("content-length")) > maxBytes) {
    await request.body?.cancel();
    throw new BodyTooLarge();
  }
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Empty body");
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new BodyTooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}
