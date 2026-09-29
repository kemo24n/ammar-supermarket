import { asc, eq } from "drizzle-orm";
import Papa from "papaparse";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const u = await getCurrentUser();
  if (!u || !["ADMIN", "STAFF"].includes(u.role)) return new Response("Unauthorized", { status: 401 });
  const rows = await db.select({
    sku: schema.products.sku, name: schema.products.name, category: schema.categories.name, sold_by: schema.products.soldBy, price: schema.products.price,
    compare_price: schema.products.comparePrice, stock: schema.products.stock, unit: schema.products.unit, brand: schema.products.brand,
    barcode: schema.products.barcode, image: schema.products.image, active: schema.products.active, description: schema.products.description,
  }).from(schema.products).innerJoin(schema.categories, eq(schema.categories.id, schema.products.categoryId)).orderBy(asc(schema.categories.sort), asc(schema.products.name));
  const csv = "﻿" + Papa.unparse(rows.map((r) => ({ ...r, stock: r.sold_by === "weight" ? r.stock / 1000 : r.stock })));
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ammar-products-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
