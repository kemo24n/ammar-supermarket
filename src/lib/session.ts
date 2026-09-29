// Edge-safe session helpers (used by middleware and server code).
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/db/schema";

export const SESSION_COOKIE = "ammar_session";
export type Session = { uid: string; role: Role; name: string };

function key() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET must be set (16+ chars)");
  return new TextEncoder().encode(s);
}

export async function signSession(s: Session) {
  return new SignJWT(s).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(key());
}

export async function verifySession(token?: string | null): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return { uid: String(payload.uid), role: payload.role as Role, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
