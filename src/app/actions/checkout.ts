"use server";
import { z } from "zod";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { placeOrder, quote, type Quote } from "@/lib/orders";
import { normalizePhone } from "@/lib/format";
import { orderToken } from "@/lib/token";
import { getSettings, slotsOf } from "@/lib/settings";
import { clientIp, hit } from "@/lib/ratelimit";

const Lines = z.array(z.object({ id: z.string().min(1).max(64), qty: z.number().int().min(1).max(99), grams: z.number().int().min(50).max(10000).nullish() })).max(200);

export async function quoteAction(input: { items: { id: string; qty: number; grams?: number | null }[]; zoneId?: string; couponCode?: string; usePoints?: boolean }): Promise<Quote> {
  const items = Lines.parse(input.items);
  if (!hit(`quote:${await clientIp()}`, 240, 60_000)) throw new Error("rate limited");
  const s = await getSession();
  return quote({ items, zoneId: input.zoneId || null, couponCode: input.couponCode || null, usePoints: !!input.usePoints, userId: s?.uid ?? null });
}

const OrderSchema = z.object({
  items: Lines.min(1, "السلة فارغة"),
  customerName: z.string().trim().min(2, "اكتب الاسم").max(60),
  phone: z.string().min(9, "رقم الموبايل غير صحيح").max(20),
  zoneId: z.string().min(1, "اختر المنطقة"),
  street: z.string().trim().min(3, "اكتب الشارع / أقرب معلم").max(160),
  building: z.string().trim().max(60).optional(),
  floor: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(300).optional(),
  slot: z.string().min(1),
  payment: z.enum(["COD_SYP", "COD_USD"]),
  couponCode: z.string().trim().max(30).optional(),
  usePoints: z.boolean().optional(),
  saveAddress: z.boolean().optional(),
});

export async function placeOrderAction(raw: z.input<typeof OrderSchema>): Promise<{ ok: true; code: string; token: string } | { ok: false; error: string }> {
  const parsed = OrderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  const phone = normalizePhone(d.phone);
  if (!/^9639\d{8}$/.test(phone)) return { ok: false, error: "أدخل رقم موبايل سوري صحيح (09xxxxxxxx)" };
  const ip = await clientIp();
  if (!hit(`order:${ip}`, 8, 30 * 60_000) || !hit(`order:${phone}`, 5, 30 * 60_000)) return { ok: false, error: "في طلبات كتيرة من نفس الرقم — تواصل معنا واتساب إذا بدك تكمّل" };
  const settings = await getSettings();
  const slot = slotsOf(settings).includes(d.slot) ? d.slot : slotsOf(settings)[0];
  const s = await getSession();
  const addressText = [d.street, d.building && `بناء ${d.building}`, d.floor && `طابق ${d.floor}`].filter(Boolean).join("، ");

  const res = await placeOrder({
    items: d.items, userId: s?.uid ?? null, customerName: d.customerName, phone, zoneId: d.zoneId, addressText,
    notes: d.notes, slot, payment: d.payment, couponCode: d.couponCode, usePoints: d.usePoints,
  });
  if (!res.ok) return res;
  if (s?.uid && d.saveAddress) {
    await db.insert(schema.addresses).values({ userId: s.uid, zoneId: d.zoneId, street: d.street, building: d.building, floor: d.floor, label: "البيت" }).catch(() => {});
  }
  return { ok: true, code: res.order.code, token: orderToken(res.order.code) };
}
