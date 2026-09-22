// Set at build time; shared with the client-side admin preview.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://chinarlipark.az"
).replace(/\/+$/, "");
