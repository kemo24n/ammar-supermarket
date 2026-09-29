"use server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { checkOrderToken } from "@/lib/token";

export async function rateOrderAction(code: string, token: string, rating: number) {
  if (!checkOrderToken(code, token) || rating < 1 || rating > 5) return;
  await db.update(schema.orders).set({ rating: Math.round(rating) }).where(and(eq(schema.orders.code, code), eq(schema.orders.status, "DELIVERED")));
  revalidatePath(`/order/${code}`);
}
