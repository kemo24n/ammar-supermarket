"use server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";

export async function toggleFavoriteAction(productId: string, on: boolean) {
  const s = await getSession();
  if (!s) return { ok: false as const, login: true };
  if (on) await db.insert(schema.favorites).values({ userId: s.uid, productId }).onConflictDoNothing();
  else await db.delete(schema.favorites).where(and(eq(schema.favorites.userId, s.uid), eq(schema.favorites.productId, productId)));
  return { ok: true as const };
}
