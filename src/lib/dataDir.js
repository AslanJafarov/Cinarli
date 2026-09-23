import path from "node:path";

// Server-only. Everything the admin panel saves lives in one folder outside the app code,
// so deploys don't overwrite it. Set DATA_DIR on the server to keep it somewhere else.
// Kept in its own module so the request proxy can import it without pulling in the image
// library that src/lib/store.js needs.
// The ignore comment keeps the build from bundling the whole project because of this runtime path.
export const dataDir = path.resolve(
  /*turbopackIgnore: true*/ process.env.DATA_DIR || path.join(process.cwd(), "storage"),
);
