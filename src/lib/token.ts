import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Unguessable per-order tracking token (so order codes alone can't be enumerated). */
export function orderToken(code: string) {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "x").update(`order:${code}`).digest("base64url").slice(0, 18);
}

export function checkOrderToken(code: string, token?: string | null) {
  if (!token) return false;
  const a = Buffer.from(orderToken(code)); const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
