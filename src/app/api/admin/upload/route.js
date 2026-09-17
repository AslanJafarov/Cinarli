import { isLoggedIn } from "@/lib/auth";
import { saveUpload } from "@/lib/store";

const MAX_BYTES = 15 * 1024 * 1024;

// Admin panel image upload: stores the file and returns { src, width, height }.
export async function POST(request) {
  if (!(await isLoggedIn())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = (await request.formData()).get("file");
  if (!file || typeof file === "string" || file.size === 0 || file.size > MAX_BYTES) {
    return Response.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    return Response.json(await saveUpload(Buffer.from(await file.arrayBuffer())));
  } catch {
    // sharp couldn't read it: not an image.
    return Response.json({ error: "Invalid image" }, { status: 400 });
  }
}
