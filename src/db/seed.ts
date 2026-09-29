/* eslint-disable no-console */
// Seed: realistic Aleppo supermarket catalogue (sample — replace with the store's real items via Admin → Import CSV).
// Catalogue lives in ./catalog-data.ts. Prices in NEW Syrian pounds (USD ≈ 138).
import { readFileSync, existsSync } from "node:fs";
if (!process.env.DATABASE_URL && existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function main() {
  const { db, schema } = await import("./index");
  const bcrypt = (await import("bcryptjs")).default;
  const { sql } = await import("drizzle-orm");

  const { IMG, CATEGORIES, CATALOGUE } = await import("./catalog-data");
  const { weightPrice, gramsLabel } = await import("../lib/weight");

  const existing = await db.execute(sql`select count(*)::int as n from products`).catch(() => ({ rows: [{ n: 0 }] }));
  const n0 = Number((existing as { rows: { n: number }[] }).rows[0]?.n ?? 0);
  if (n0 > 0 && process.env.FORCE_SEED !== "1") {
    console.log(`✋ Database already has ${n0} products — skipping seed. Run with FORCE_SEED=1 to wipe and re-seed.`);
    process.exit(0);
  }
  const DEMO = process.env.SEED_DEMO !== "0"; // demo customers + 14 days of order history for the dashboard

  console.log("→ clearing tables");
  await db.execute(sql`truncate table order_events, order_items, orders, points_tx, addresses, products, categories, banners, coupons, delivery_zones, users, settings restart identity cascade`);

  await db.insert(schema.settings).values({ id: 1, usdRate: 138, minOrder: 200, freeDeliveryOver: 2000, announcement: "توصيل مجاني للطلبات فوق 2,000 ل.س — لكل أحياء حلب" });

  console.log("→ zones");
  const zoneRows = await db.insert(schema.zones).values([
    ["المحافظة", 15, 20], ["العزيزية", 25, 25], ["الجميلية", 25, 25], ["السليمانية", 30, 30], ["الإسماعيلية", 25, 25],
    ["السبيل", 25, 30], ["سيف الدولة", 30, 35], ["الموكامبو", 30, 35], ["الأعظمية", 30, 35], ["الفرقان", 35, 40],
    ["حلب الجديدة", 35, 40], ["الشهباء", 40, 45], ["الزهراء", 40, 45], ["الحمدانية", 50, 50], ["الشعار", 35, 40], ["باب الفرج", 25, 30],
  ].map(([name, fee, minutes], i) => ({ name: name as string, fee: fee as number, minutes: minutes as number, sort: i }))).returning();

  console.log("→ categories");
  const cats = CATEGORIES;
  const catRows = await db.insert(schema.categories).values(cats.map((c, i) => ({ ...c, sort: i }))).returning();
  const C = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

  console.log("→ products");
  let n = 0;
  const productRows: { id: string; price: number; name: string; unit: string; image: string | null; soldBy: string }[] = [];
  for (const [slug, list] of Object.entries(CATALOGUE)) {
    const rows = await db.insert(schema.products).values(list.map(([name, unit, price, compare, stock, image, brand, o]) => {
      n++;
      return {
        name, unit, price, comparePrice: compare, stock, image, brand: brand ?? null, featured: !!o?.f,
        soldBy: o?.w ? "weight" : "unit", weightOptions: o?.opts ?? "500,1000",
        description: o?.d ?? null,
        slug: `p-${String(n).padStart(3, "0")}`, sku: `AM${String(1000 + n)}`, categoryId: C[slug], soldCount: Math.floor(Math.random() * (o?.f ? 260 : 140)),
      };
    })).returning({ id: schema.products.id, price: schema.products.price, name: schema.products.name, unit: schema.products.unit, image: schema.products.image, soldBy: schema.products.soldBy });
    productRows.push(...rows);
  }

  console.log("→ banners & coupons");
  await db.insert(schema.banners).values([
    { title: "احسبها صح.. بالمكان الأوفر", subtitle: "كل احتياجات بيتك بأسعار محسوبة، وتوصيل لباب البيت بكل أحياء حلب", cta: "تسوّق العروض", href: "/offers", image: IMG.produceAisle, theme: "red", sort: 0 },
    { title: "طلباتك كتيرة؟ الحل عنا!", subtitle: "عبّي سلتك من البيت وادفع كاش عند الاستلام — بالليرة أو بالدولار", cta: "ابدأ التسوق", href: "/categories", image: IMG.aisle, theme: "dark", sort: 1 },
    { title: "مونة حلبية أصلية", subtitle: "فليفلة حلبية، زعتر، مكدوس وصابون غار — من قلب حلب", cta: "تسوّق المونة", href: "/category/aleppo-pantry", image: IMG.spiceShop, theme: "dark", sort: 3 },
    { title: "خضرة الصبح.. طازة كل يوم", subtitle: "خضار وفواكه تنتقى من سوق الهال كل صباح", cta: "تسوّق الخضار", href: "/category/vegetables-fruits", image: IMG.market, theme: "light", sort: 2 },
  ]);
  await db.insert(schema.coupons).values([
    { code: "AMMAR10", type: "PERCENT", value: 10, minOrder: 700 },
    { code: "WELCOME", type: "FIXED", value: 75, minOrder: 400, maxUses: 500 },
    { code: "FREESHIP", type: "FREE_DELIVERY", value: 0, minOrder: 400 },
  ]);

  console.log("→ users");
  const hash = (p: string) => bcrypt.hash(p, 10);
  const [admin] = await db.insert(schema.users).values({ name: "عمار — المدير", phone: "963900000001", passwordHash: await hash("Ammar@2026"), role: "ADMIN" }).returning();
  await db.insert(schema.users).values({ name: "موظف الصندوق", phone: "963900000002", passwordHash: await hash("Staff@2026"), role: "STAFF" });
  const drivers = await db.insert(schema.users).values([
    { name: "أبو خالد — سائق", phone: "963900000011", passwordHash: await hash("Driver@2026"), role: "DRIVER", vehicle: "دراجة نارية" },
    { name: "سامر — سائق", phone: "963900000012", passwordHash: await hash("Driver@2026"), role: "DRIVER", vehicle: "سيارة فان" },
  ]).returning();
  if (!DEMO) {
    console.log(`✓ seeded ${n} products (no demo orders). Admin: 0900000001 / Ammar@2026 — change it from Admin → Team.`);
    process.exit(0);
  }
  const names = ["رهف الحلبي", "محمد قباني", "لين شهابي", "أحمد عطار", "نور الهدى", "ياسر كيالي", "سلمى جابري", "عمر دباغ"];
  const customers = await db.insert(schema.users).values(await Promise.all(names.map(async (name, i) => ({
    name, phone: `96399${String(1000000 + i * 1371).slice(0, 7)}`, passwordHash: await hash("Customer@2026"), role: "CUSTOMER" as const, points: 40 + i * 23,
  })))).returning();
  const demo = customers[0];
  await db.insert(schema.addresses).values({ userId: demo.id, label: "البيت", zoneId: zoneRows[2].id, street: "شارع الجميلية، جانب جامع الروضة", building: "بناء 12", floor: "3" });

  console.log("→ order history (for dashboard)");
  const statuses = ["DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED", "CANCELLED"] as const;
  let codeN = 24000;
  for (let d = 13; d >= 0; d--) {
    const perDay = 3 + Math.floor(Math.random() * 6) + (d < 3 ? 3 : 0);
    for (let k = 0; k < perDay; k++) {
      const cust = customers[Math.floor(Math.random() * customers.length)];
      const zone = zoneRows[Math.floor(Math.random() * zoneRows.length)];
      const picks = [...productRows].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 6));
      const lines = picks.map((p) => {
        if (p.soldBy === "weight") { const g = Math.random() > 0.5 ? 1000 : 500; return { ...p, grams: g, unit: gramsLabel(g), price: weightPrice(p.price, g), qty: 1 + Math.floor(Math.random() * 2) }; }
        return { ...p, grams: null as number | null, qty: 1 + Math.floor(Math.random() * 3) };
      });
      const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
      const fee = subtotal >= 2000 ? 0 : zone.fee;
      const created = new Date(Date.now() - d * 86400000 - Math.floor(Math.random() * 10 * 3600000));
      let status: (typeof schema.orderStatusEnum.enumValues)[number] = statuses[Math.floor(Math.random() * statuses.length)];
      if (d === 0) status = (["PENDING", "PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"] as const)[k % 6];
      const [o] = await db.insert(schema.orders).values({
        code: `AM-${codeN++}`, userId: cust.id, customerName: cust.name, phone: cust.phone, zoneId: zone.id,
        addressText: `${zone.name} — شارع رئيسي، بناء ${1 + (k % 20)}`, slot: "بأسرع وقت", status,
        payment: Math.random() > 0.8 ? "COD_USD" : "COD_SYP", subtotal, deliveryFee: fee, total: subtotal + fee, usdRate: 138,
        pointsEarned: Math.floor(subtotal / 100), driverId: ["OUT_FOR_DELIVERY", "DELIVERED"].includes(status) ? drivers[k % 2].id : null,
        cashCollected: status === "DELIVERED", rating: status === "DELIVERED" && Math.random() > 0.55 ? (Math.random() > 0.25 ? 5 : 4) : null, createdAt: created, updatedAt: created,
      }).returning();
      await db.insert(schema.orderItems).values(lines.map((l) => ({ orderId: o.id, productId: l.id, name: l.name, unit: l.unit, image: l.image, grams: l.grams, price: l.price, qty: l.qty })));
      await db.insert(schema.orderEvents).values({ orderId: o.id, status: "PENDING", note: "تم استلام الطلب", createdAt: created });
      if (status !== "PENDING") await db.insert(schema.orderEvents).values({ orderId: o.id, status, createdAt: new Date(created.getTime() + 40 * 60000) });
    }
  }

  console.log(`✓ seeded ${n} products, ${catRows.length} categories, ${zoneRows.length} zones. Admin: 0900000001 / Ammar@2026 (${admin.name})`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
