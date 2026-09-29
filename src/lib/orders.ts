import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { OrderStatus, PaymentMethod, Settings } from "@/db/schema";
import { getSettings } from "./settings";
import { notifyStoreNewOrder } from "./whatsapp";
import { gramsLabel, unitsInStock, weightOptions, weightPrice } from "./weight";

export type CartLine = { id: string; qty: number; grams?: number | null };

export type QuoteInput = {
  items: CartLine[];
  zoneId?: string | null;
  couponCode?: string | null;
  usePoints?: boolean;
  userId?: string | null;
};

export type Quote = {
  lines: { id: string; grams: number | null; name: string; unit: string; image: string | null; price: number; qty: number; stock: number; lineTotal: number }[];
  hasWeightItems: boolean;
  subtotal: number;
  deliveryFee: number;
  couponDiscount: number;
  pointsDiscount: number;
  pointsUsed: number;
  pointsAvailable: number;
  pointsToEarn: number;
  total: number;
  coupon: { code: string; label: string } | null;
  zone: { id: string; name: string; minutes: number } | null;
  problems: string[];
  minOrder: number;
  freeDeliveryOver: number;
};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Server-side price engine: never trusts client prices. */
export async function quote(input: QuoteInput, tx: Tx | typeof db = db, settingsArg?: Settings): Promise<Quote> {
  const settings = settingsArg ?? (await getSettings());
  const problems: string[] = [];
  const ids = [...new Set(input.items.map((i) => i.id))].slice(0, 200);
  const rows = ids.length
    ? await tx.select().from(schema.products).where(and(inArray(schema.products.id, ids), eq(schema.products.active, true)))
    : [];
  const byId = new Map(rows.map((r) => [r.id, r]));

  const lines: Quote["lines"] = [];
  const seen = new Set<string>();
  for (const it of input.items) {
    const p = byId.get(it.id);
    const qty = Math.max(1, Math.min(99, Math.floor(it.qty || 1)));
    if (!p) { problems.push("بعض المنتجات لم تعد متوفرة وتمت إزالتها"); continue; }
    if (p.soldBy === "weight") {
      const opts = weightOptions(p.weightOptions);
      const grams = it.grams && opts.includes(it.grams) ? it.grams : opts[0];
      const key = `${p.id}@${grams}`;
      if (seen.has(key)) continue; seen.add(key);
      const usedByOthers = lines.filter((l) => l.id === p.id).reduce((s, l) => s + l.qty * (l.grams ?? 0), 0);
      const available = unitsInStock(Math.max(0, p.stock - usedByOthers), grams);
      if (available <= 0) { problems.push(`نفدت الكمية: ${p.name}`); continue; }
      const q = Math.min(qty, available);
      if (q < qty) problems.push(`الكمية المتوفرة من ${p.name}: ${available} × ${gramsLabel(grams)} فقط`);
      const price = weightPrice(p.price, grams);
      lines.push({ id: p.id, grams, name: p.name, unit: gramsLabel(grams), image: p.image, price, qty: q, stock: available, lineTotal: price * q });
      continue;
    }
    if (seen.has(p.id)) continue; seen.add(p.id);
    if (p.stock <= 0) { problems.push(`نفدت الكمية: ${p.name}`); continue; }
    const q = Math.min(qty, p.stock);
    if (q < qty) problems.push(`الكمية المتوفرة من ${p.name}: ${p.stock} فقط`);
    lines.push({ id: p.id, grams: null, name: p.name, unit: p.unit, image: p.image, price: p.price, qty: q, stock: p.stock, lineTotal: p.price * q });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  let zone: Quote["zone"] = null;
  let deliveryFee = 0;
  if (input.zoneId) {
    const z = await tx.query.zones.findFirst({ where: and(eq(schema.zones.id, input.zoneId), eq(schema.zones.active, true)) });
    if (z) { zone = { id: z.id, name: z.name, minutes: z.minutes }; deliveryFee = z.fee; }
    else problems.push("منطقة التوصيل غير متاحة");
  }
  if (subtotal >= settings.freeDeliveryOver) deliveryFee = 0;

  let couponDiscount = 0;
  let coupon: Quote["coupon"] = null;
  if (input.couponCode) {
    const code = input.couponCode.trim().toUpperCase();
    const c = await tx.query.coupons.findFirst({ where: eq(schema.coupons.code, code) });
    const expired = c?.expiresAt && c.expiresAt.getTime() < Date.now();
    const exhausted = c?.maxUses != null && c.used >= c.maxUses;
    if (!c || !c.active || expired || exhausted) problems.push("كود الخصم غير صالح أو منتهي");
    else if (subtotal < c.minOrder) problems.push(`كود ${c.code} يتطلب طلباً بقيمة ${c.minOrder.toLocaleString("en-US")} ل.س على الأقل`);
    else {
      if (c.type === "PERCENT") couponDiscount = Math.floor((subtotal * Math.min(c.value, 90)) / 100);
      if (c.type === "FIXED") couponDiscount = Math.min(c.value, subtotal);
      if (c.type === "FREE_DELIVERY") couponDiscount = deliveryFee;
      coupon = {
        code: c.code,
        label: c.type === "PERCENT" ? `خصم ${c.value}%` : c.type === "FIXED" ? `خصم ${c.value.toLocaleString("en-US")} ل.س` : "توصيل مجاني",
      };
    }
  }

  let pointsAvailable = 0, pointsUsed = 0, pointsDiscount = 0;
  if (input.userId) {
    const u = await tx.query.users.findFirst({ where: eq(schema.users.id, input.userId), columns: { points: true } });
    pointsAvailable = u?.points ?? 0;
    if (input.usePoints && pointsAvailable > 0) {
      const cap = Math.floor((subtotal - couponDiscount) * 0.5); // points can cover up to 50% of the basket
      pointsDiscount = Math.min(pointsAvailable * settings.pointValue, Math.max(cap, 0));
      pointsUsed = Math.ceil(pointsDiscount / Math.max(settings.pointValue, 1));
    }
  }

  const total = Math.max(0, subtotal + deliveryFee - couponDiscount - pointsDiscount);
  const pointsToEarn = input.userId ? Math.floor((subtotal - couponDiscount - pointsDiscount) / Math.max(settings.pointsPerAmount, 1)) : 0;
  if (lines.length && subtotal < settings.minOrder) problems.push(`الحد الأدنى للطلب ${settings.minOrder.toLocaleString("en-US")} ل.س`);

  return {
    lines, hasWeightItems: lines.some((l) => l.grams), subtotal, deliveryFee, couponDiscount, pointsDiscount, pointsUsed, pointsAvailable, pointsToEarn, total, coupon, zone,
    problems: [...new Set(problems)], minOrder: settings.minOrder, freeDeliveryOver: settings.freeDeliveryOver,
  };
}

function newCode() {
  return `AM-${Math.floor(10000 + Math.random() * 90000)}`;
}

export type PlaceOrderInput = QuoteInput & {
  customerName: string;
  phone: string;
  zoneId: string;
  addressText: string;
  notes?: string | null;
  slot: string;
  payment: PaymentMethod;
};

export async function placeOrder(input: PlaceOrderInput) {
  const settings = await getSettings();
  if (!settings.isOpen) return { ok: false as const, error: "المتجر مغلق حالياً لاستقبال الطلبات. جرّب لاحقاً" };

  const result = await db.transaction(async (tx) => {
    // Lock product rows to prevent overselling under concurrent checkouts.
    const ids = [...new Set(input.items.map((i) => i.id))];
    if (ids.length) await tx.execute(sql`select id from products where id in ${ids} for update`);

    const q = await quote(input, tx, settings);
    if (!q.lines.length) return { ok: false as const, error: "السلة فارغة" };
    const blocking = q.problems.filter((p) => !p.startsWith("الكمية المتوفرة"));
    if (blocking.length) return { ok: false as const, error: blocking[0] };

    let code = newCode();
    for (let i = 0; i < 5; i++) {
      const exists = await tx.query.orders.findFirst({ where: eq(schema.orders.code, code), columns: { id: true } });
      if (!exists) break;
      code = newCode();
    }

    const [order] = await tx.insert(schema.orders).values({
      code,
      userId: input.userId ?? null,
      customerName: input.customerName.trim(),
      phone: input.phone,
      zoneId: input.zoneId,
      addressText: input.addressText.trim(),
      notes: input.notes?.trim() || null,
      slot: input.slot,
      payment: input.payment,
      subtotal: q.subtotal,
      deliveryFee: q.deliveryFee,
      discount: q.couponDiscount,
      pointsUsed: q.pointsUsed,
      pointsEarned: q.pointsToEarn,
      total: q.total,
      usdRate: settings.usdRate,
      couponCode: q.coupon?.code ?? null,
    }).returning();

    await tx.insert(schema.orderItems).values(q.lines.map((l) => ({
      orderId: order.id, productId: l.id, name: l.name, unit: l.unit, image: l.image, grams: l.grams, price: l.price, qty: l.qty,
    })));
    for (const l of q.lines) {
      await tx.update(schema.products)
        .set({ stock: sql`${schema.products.stock} - ${l.qty * (l.grams ?? 1)}`, soldCount: sql`${schema.products.soldCount} + ${l.qty}` })
        .where(eq(schema.products.id, l.id));
    }
    await tx.insert(schema.orderEvents).values({ orderId: order.id, status: "PENDING", note: "تم استلام الطلب" });
    if (q.coupon) {
      await tx.update(schema.coupons).set({ used: sql`${schema.coupons.used} + 1` }).where(eq(schema.coupons.code, q.coupon.code));
    }
    if (input.userId && q.pointsUsed > 0) {
      await tx.update(schema.users).set({ points: sql`${schema.users.points} - ${q.pointsUsed}` }).where(eq(schema.users.id, input.userId));
      await tx.insert(schema.pointsTx).values({ userId: input.userId, amount: -q.pointsUsed, reason: `استخدام نقاط — طلب ${code}` });
    }
    return { ok: true as const, order, quote: q };
  });

  if (result.ok) {
    notifyStoreNewOrder(result.order, result.quote, settings).catch(() => {});
  }
  return result;
}

/** Status transitions with side effects (points on delivery, stock/points restore on cancel). */
export async function setOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(schema.orders).where(eq(schema.orders.id, orderId)).for("update");
    if (!order) throw new Error("Order not found");
    if (order.status === status) return order;
    if (order.status === "DELIVERED" || order.status === "CANCELLED") throw new Error("لا يمكن تعديل طلب مكتمل أو ملغي");

    if (status === "CANCELLED") {
      const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
      for (const it of items) {
        if (!it.productId) continue;
        await tx.update(schema.products)
          .set({ stock: sql`${schema.products.stock} + ${it.qty * (it.grams ?? 1)}`, soldCount: sql`greatest(${schema.products.soldCount} - ${it.qty}, 0)` })
          .where(eq(schema.products.id, it.productId));
      }
      if (order.userId && order.pointsUsed > 0) {
        await tx.update(schema.users).set({ points: sql`${schema.users.points} + ${order.pointsUsed}` }).where(eq(schema.users.id, order.userId));
        await tx.insert(schema.pointsTx).values({ userId: order.userId, amount: order.pointsUsed, reason: `استرجاع نقاط — إلغاء ${order.code}` });
      }
    }
    if (status === "DELIVERED" && order.userId && order.pointsEarned > 0) {
      await tx.update(schema.users).set({ points: sql`${schema.users.points} + ${order.pointsEarned}` }).where(eq(schema.users.id, order.userId));
      await tx.insert(schema.pointsTx).values({ userId: order.userId, amount: order.pointsEarned, reason: `نقاط مكتسبة — طلب ${order.code}` });
    }
    const [updated] = await tx.update(schema.orders)
      .set({ status, ...(status === "DELIVERED" ? { cashCollected: true } : {}) })
      .where(eq(schema.orders.id, orderId)).returning();
    await tx.insert(schema.orderEvents).values({ orderId, status, note: note ?? null });
    return updated;
  });
}
