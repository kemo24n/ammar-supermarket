import { readFile } from "node:fs/promises";
import path from "node:path";

const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

// Serves images uploaded from the admin panel (stored outside /public so they work after `next build`).
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[\w.-]+$/.test(name)) return new Response("Not found", { status: 404 });
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (!TYPES[ext]) return new Response("Not found", { status: 404 });
  const dir = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");
  try {
    const buf = await readFile(path.join(dir, name));
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": TYPES[ext], "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
