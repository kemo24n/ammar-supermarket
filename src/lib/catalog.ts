import "server-only";
import { and, asc, desc, eq, gt, ilike, inArray, isNotNull, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";

const p = schema.products;
const cardCols = {
  id: p.id, slug: p.slug, name: p.name, brand: p.brand, unit: p.unit, price: p.price, comparePrice: p.comparePrice,
  stock: p.stock, image: p.image, soldBy: p.soldBy, weightOptions: p.weightOptions, description: p.description, category: { icon: schema.categories.icon },
};

function base(where: SQL | undefined) {
  return db.select(cardCols).from(p).innerJoin(schema.categories, eq(p.categoryId, schema.categories.id))
    .where(and(eq(p.active, true), where));
}

export const listFeatured = (limit = 12) => base(eq(p.featured, true)).orderBy(desc(p.soldCount)).limit(limit);
export const listBestSellers = (limit = 12) => base(gt(p.stock, 0)).orderBy(desc(p.soldCount)).limit(limit);
export const listOffers = (limit = 60) =>
  base(and(isNotNull(p.comparePrice), gt(p.comparePrice, p.price))).orderBy(desc(sql`(${p.comparePrice} - ${p.price})::float / ${p.comparePrice}`)).limit(limit);
export const listByCategory = (categoryId: string, limit = 12) => base(eq(p.categoryId, categoryId)).orderBy(desc(p.featured), desc(p.soldCount)).limit(limit);

export type SortKey = "popular" | "price-asc" | "price-desc" | "discount" | "new";
export function sortExpr(sort: SortKey) {
  switch (sort) {
    case "price-asc": return [asc(p.price)];
    case "price-desc": return [desc(p.price)];
    case "discount": return [desc(sql`coalesce(${p.comparePrice} - ${p.price}, 0)`)];
    case "new": return [desc(p.createdAt)];
    default: return [desc(sql`${p.stock} > 0`), desc(p.featured), desc(p.soldCount)];
  }
}

export function searchProducts(q: string, sort: SortKey = "popular", limit = 60) {
  const term = `%${q.trim().replace(/[%_]/g, "")}%`;
  return base(or(ilike(p.name, term), ilike(p.brand, term), ilike(p.description, term), ilike(schema.categories.name, term), eq(p.barcode, q.trim())))
    .orderBy(...sortExpr(sort)).limit(limit);
}

export function listCategoryProducts(categoryId: string, sort: SortKey, onlyAvailable: boolean, onlyOffers: boolean) {
  return base(and(
    eq(p.categoryId, categoryId),
    onlyAvailable ? gt(p.stock, 0) : undefined,
    onlyOffers ? and(isNotNull(p.comparePrice), gt(p.comparePrice, p.price)) : undefined,
  )).orderBy(...sortExpr(sort));
}

export const listCategories = () =>
  db.select({
    id: schema.categories.id, slug: schema.categories.slug, name: schema.categories.name, icon: schema.categories.icon,
    image: schema.categories.image, tint: schema.categories.tint,
    count: sql<number>`(select count(*)::int from products where products.category_id = "categories"."id" and products.active)`,
  }).from(schema.categories).where(eq(schema.categories.active, true)).orderBy(asc(schema.categories.sort));

export async function listBuyAgain(userId: string, limit = 12) {
  const rows = await db.execute<{ product_id: string }>(sql`
    select oi.product_id from order_items oi join orders o on o.id = oi.order_id
    where o.user_id = ${userId} and o.status <> 'CANCELLED' and oi.product_id is not null
    group by oi.product_id order by max(o.created_at) desc limit ${limit}`);
  const ids = rows.rows.map((r) => r.product_id);
  if (!ids.length) return [];
  const list = await base(inArray(p.id, ids));
  return ids.map((id) => list.find((x) => x.id === id)).filter((x): x is (typeof list)[number] => !!x);
}

export async function listFavorites(userId: string) {
  return db.select(cardCols).from(p).innerJoin(schema.categories, eq(p.categoryId, schema.categories.id))
    .innerJoin(schema.favorites, and(eq(schema.favorites.productId, p.id), eq(schema.favorites.userId, userId)))
    .where(eq(p.active, true)).orderBy(desc(schema.favorites.createdAt));
}

export const listFresh = (limit = 12) =>
  base(eq(p.soldBy, "weight")).orderBy(desc(sql`${p.stock} > 0`), desc(p.featured), desc(p.soldCount)).limit(limit);
