import { readUpload } from "@/lib/media";
import { MEDIA_PREFIX } from "@/lib/store";

// Serves photos uploaded in the admin panel. File names are random and never reused,
// so browsers can cache them forever.
export async function GET(request, { params }) {
  const { name } = await params;
  const file = await readUpload(`${MEDIA_PREFIX}${name}`);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(file, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
