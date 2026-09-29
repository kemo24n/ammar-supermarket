"use server";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { checkOrderToken } from "@/lib/token";
import type { CartItem } from "@/store/cart";
import { gramsLabel, lineKey, unitsInStock, weightOptions, weightPrice } from "@/lib/weight";

/** Rebuilds cart lines from a past order using TODAY's prices and stock. */
export async function reorderAction(code: string, token?: string): Promise<{ items: CartItem[]; missing: number }> {
  const s = await getSession();
  const o = await db.query.orders.findFirst({ where: eq(schema.orders.code, code), with: { items: true } });
  if (!o) return { items: [], missing: 0 };
  if (!(checkOrderToken(code, token) || (s && s.uid === o.userId))) return { items: [], missing: 0 };
  const ids = o.items.map((i) => i.productId).filter((x): x is string => !!x);
  const prods = ids.length ? await db.query.products.findMany({ where: and(inArray(schema.products.id, ids), eq(schema.products.active, true)), with: { category: { columns: { icon: true } } } }) : [];
  let missing = 0;
  const items = o.items.flatMap((it): CartItem[] => {
    const p = prods.find((x) => x.id === it.productId);
    if (!p) { missing++; return []; }
    if (p.soldBy === "weight") {
      const opts = weightOptions(p.weightOptions);
      const grams = it.grams && opts.includes(it.grams) ? it.grams : opts[opts.length - 1];
      const stock = unitsInStock(p.stock, grams);
      if (stock <= 0) { missing++; return []; }
      return [{ key: lineKey(p.id, grams), id: p.id, slug: p.slug, name: p.name, unit: gramsLabel(grams), price: weightPrice(p.price, grams), grams, image: p.image, qty: Math.min(it.qty, stock), stock, categoryIcon: p.category.icon }];
    }
    if (p.stock <= 0) { missing++; return []; }
    return [{ key: p.id, id: p.id, slug: p.slug, name: p.name, unit: p.unit, price: p.price, grams: null, image: p.image, qty: Math.min(it.qty, p.stock), stock: p.stock, categoryIcon: p.category.icon }];
  });
  return { items, missing };
}
