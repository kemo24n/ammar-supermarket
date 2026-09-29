import { cache } from "react";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const getSettings = cache(async () => {
  const row = await db.query.settings.findFirst({ where: eq(schema.settings.id, 1) });
  if (row) return row;
  const [created] = await db.insert(schema.settings).values({ id: 1 }).returning();
  return created;
});

export function slotsOf(s: { slots: string }) {
  return s.slots.split("|").map((x) => x.trim()).filter(Boolean);
}
