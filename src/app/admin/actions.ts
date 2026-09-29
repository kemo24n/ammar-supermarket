"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { z } from "zod";
import Papa from "papaparse";
import { db, schema } from "@/db";
import type { OrderStatus, Role } from "@/db/schema";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { setOrderStatus } from "@/lib/orders";
import { normalizePhone, slugify } from "@/lib/format";

async function guard(roles: Role[] = ["ADMIN", "STAFF"]) {
  const u = await getCurrentUser();
  if (!u || !roles.includes(u.role)) throw new Error("غير مصرّح");
  return u;
}
const adminOnly = () => guard(["ADMIN"]);

export type FormState = { ok?: boolean; error?: string; message?: string } | undefined;

const int = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").replace(/[,\s]/g, "").replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  return s === "" ? null : Math.round(Number(s));
};
const str = (v: FormDataEntryValue | null) => { const s = String(v ?? "").trim(); return s === "" ? null : s; };
const bool = (v: FormDataEntryValue | null) => v === "on" || v === "true" || v === "1";

/* ---------------- uploads ---------------- */
async function saveUpload(file: File | null) {
  if (!file || file.size === 0) return null;
  if (file.size > 4 * 1024 * 1024) throw new Error("حجم الصورة أكبر من 4MB");
  const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as Record<string, string>)[file.type];
  if (!ext) throw new Error("صيغة الصورة غير مدعومة (JPG/PNG/WEBP)");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error("إعدادات التخزين غير مكتملة");
  const res = await fetch(`${base}/storage/v1/object/uploads/${name}`, {
    method: "POST",
    headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), "Content-Type": file.type },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!res.ok) throw new Error("فشل رفع الصورة");
  return `${base}/storage/v1/object/public/uploads/${name}`;
}

/* ---------------- orders ---------------- */
export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await guard(["ADMIN", "STAFF", "DRIVER"]);
  const u = await getCurrentUser();
  if (u?.role === "DRIVER") {
    const o = await db.query.orders.findFirst({ where: eq(schema.orders.id, orderId), columns: { driverId: true } });
    if (o?.driverId !== u.id || !["OUT_FOR_DELIVERY", "DELIVERED"].includes(status)) throw new Error("غير مصرّح");
  }
  await setOrderStatus(orderId, status, u ? `بواسطة ${u.name}` : undefined);
  revalidatePath("/admin", "layout");
  revalidatePath("/driver", "layout");
}

export async function assignDriverAction(orderId: string, driverId: string | null) {
  await guard();
  await db.update(schema.orders).set({ driverId: driverId || null }).where(eq(schema.orders.id, orderId));
  revalidatePath("/admin", "layout");
}

export async function setCashCollectedAction(orderId: string, v: boolean) {
  await guard(["ADMIN", "STAFF", "DRIVER"]);
  await db.update(schema.orders).set({ cashCollected: v }).where(eq(schema.orders.id, orderId));
  revalidatePath("/admin", "layout");
  revalidatePath("/driver", "layout");
}

/* ---------------- products ---------------- */
const ProductSchema = z.object({
  name: z.string().min(2, "اسم المنتج مطلوب"),
  categoryId: z.string().min(1, "اختر القسم"),
  price: z.number({ error: "السعر مطلوب" }).int().min(0),
  comparePrice: z.number().int().min(0).nullable(),
  stock: z.number().int().min(0).default(0),
  unit: z.string().min(1).default("قطعة"),
});

export async function saveProductAction(_: FormState, fd: FormData): Promise<FormState> {
  await guard();
  const id = str(fd.get("id"));
  const parsed = ProductSchema.safeParse({
    name: str(fd.get("name")), categoryId: str(fd.get("categoryId")), price: int(fd.get("price")),
    comparePrice: int(fd.get("comparePrice")), stock: int(fd.get("stock")) ?? 0, unit: str(fd.get("unit")) ?? "قطعة",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const soldBy = fd.get("soldBy") === "weight" ? "weight" : "unit";
  let image: string | null | undefined;
  try { image = await saveUpload(fd.get("imageFile") as File | null); } catch (e) { return { error: (e as Error).message }; }
  if (!image) image = str(fd.get("image"));
  const d = parsed.data;
  const stockKg = Number(String(fd.get("stock") ?? "0").replace(/,/g, ""));
  const values = {
    ...d,
    soldBy,
    stock: soldBy === "weight" ? Math.round((Number.isFinite(stockKg) ? stockKg : 0) * 1000) : d.stock,
    unit: soldBy === "weight" ? "كغ" : d.unit,
    comparePrice: d.comparePrice && d.comparePrice > d.price ? d.comparePrice : null,
    brand: str(fd.get("brand")), description: str(fd.get("description")), sku: str(fd.get("sku")), barcode: str(fd.get("barcode")),
    image, featured: bool(fd.get("featured")), active: bool(fd.get("active")),
  };
  try {
    if (id) await db.update(schema.products).set(values).where(eq(schema.products.id, id));
    else await db.insert(schema.products).values({ ...values, slug: `${slugify(d.name)}-${Math.random().toString(36).slice(2, 6)}` });
  } catch (e) {
    if (String(e).includes("sku")) return { error: "رمز SKU مستخدم لمنتج آخر" };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect("/admin/products?saved=1");
}

export async function quickUpdateProductAction(id: string, patch: { price?: number; stock?: number; active?: boolean; featured?: boolean }) {
  await guard();
  const clean: Record<string, number | boolean> = {};
  if (patch.price != null && patch.price >= 0) clean.price = Math.round(patch.price);
  if (patch.stock != null && patch.stock >= 0) {
    const p = await db.query.products.findFirst({ where: eq(schema.products.id, id), columns: { soldBy: true } });
    clean.stock = p?.soldBy === "weight" ? Math.round(patch.stock * 1000) : Math.round(patch.stock); // weight items: admin edits KG
  }
  if (patch.active != null) clean.active = patch.active;
  if (patch.featured != null) clean.featured = patch.featured;
  if (Object.keys(clean).length) await db.update(schema.products).set(clean).where(eq(schema.products.id, id));
  revalidatePath("/", "layout");
}

export async function deleteProductAction(id: string) {
  await guard(["ADMIN"]);
  // Soft-delete keeps order history intact.
  await db.update(schema.products).set({ active: false, sku: null }).where(eq(schema.products.id, id));
  revalidatePath("/", "layout");
}

/**
 * Bulk import from CSV / Excel-exported CSV.
 * Columns (Arabic or English headers): name|الاسم, category|القسم, price|السعر, compare_price|السعر_قبل, stock|الكمية,
 * unit|الوحدة, brand|الماركة, sku|الرمز, barcode|الباركود, image|الصورة, description|الوصف
 * Rows with an existing SKU are updated (great for daily price updates); others are created.
 */
export async function importProductsAction(_: FormState, fd: FormData): Promise<FormState> {
  await guard();
  const file = fd.get("file") as File | null;
  if (!file || file.size === 0) return { error: "اختر ملف CSV" };
  if (file.size > 4 * 1024 * 1024) return { error: "الملف كبير جداً (الحد 4MB)" };
  const text = (await file.text()).replace(/^﻿/, "");
  const { data, errors } = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim().toLowerCase() });
  if (errors.length && !data.length) return { error: "تعذّر قراءة الملف — تأكد أنه CSV" };
  const pick = (r: Record<string, string>, ...keys: string[]) => { for (const k of keys) { const v = r[k]; if (v != null && String(v).trim() !== "") return String(v).trim(); } return null; };

  const cats = await db.select().from(schema.categories);
  const catByName = new Map(cats.map((c) => [c.name.trim(), c.id]));
  let created = 0, updated = 0, catsCreated = 0;
  const skipped: string[] = [];

  for (const [i, r] of data.entries()) {
    const name = pick(r, "name", "الاسم", "اسم المنتج");
    const price = int(pick(r, "price", "السعر"));
    const catName = pick(r, "category", "القسم") ?? "متفرقات";
    if (!name || price == null || Number.isNaN(price)) { skipped.push(`سطر ${i + 2}`); continue; }
    let categoryId = catByName.get(catName);
    if (!categoryId) {
      const [c] = await db.insert(schema.categories).values({ name: catName, slug: `${slugify(catName)}-${Math.random().toString(36).slice(2, 5)}`, sort: 99 }).returning();
      categoryId = c.id; catByName.set(catName, c.id); catsCreated++;
    }
    const compare = int(pick(r, "compare_price", "السعر_قبل", "السعر قبل"));
    const byWeight = /^(weight|وزن|بالوزن|كغ)$/i.test(pick(r, "sold_by", "البيع") ?? "");
    const stock = int(pick(r, "stock", "الكمية"));
    const sku = pick(r, "sku", "الرمز");
    const values = {
      name, price, categoryId, comparePrice: compare && compare > price ? compare : null,
      soldBy: byWeight ? "weight" : "unit", stock: byWeight ? Math.round((stock ?? 50) * 1000) : stock ?? 50,
      unit: byWeight ? "كغ" : pick(r, "unit", "الوحدة") ?? "قطعة", brand: pick(r, "brand", "الماركة"), barcode: pick(r, "barcode", "الباركود"),
      image: pick(r, "image", "الصورة"), description: pick(r, "description", "الوصف"), active: true,
    };
    const existing = sku ? await db.query.products.findFirst({ where: eq(schema.products.sku, sku), columns: { id: true } }) : null;
    if (existing) { await db.update(schema.products).set(values).where(eq(schema.products.id, existing.id)); updated++; }
    else { await db.insert(schema.products).values({ ...values, sku, slug: `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}` }); created++; }
  }
  revalidatePath("/", "layout");
  return { ok: true, message: `تمت إضافة ${created} منتج وتحديث ${updated}${catsCreated ? ` وإنشاء ${catsCreated} قسم جديد` : ""}${skipped.length ? ` — تم تجاهل ${skipped.length} سطر ناقص` : ""}` };
}

/* ---------------- categories ---------------- */
export async function saveCategoryAction(_: FormState, fd: FormData): Promise<FormState> {
  await guard();
  const id = str(fd.get("id"));
  const name = str(fd.get("name"));
  if (!name) return { error: "اسم القسم مطلوب" };
  let image: string | null = null;
  try { image = (await saveUpload(fd.get("imageFile") as File | null)) ?? str(fd.get("image")); } catch (e) { return { error: (e as Error).message }; }
  const values = { name, icon: str(fd.get("icon")) ?? "ShoppingBasket", tint: str(fd.get("tint")) ?? "#FFF1F1", sort: int(fd.get("sort")) ?? 0, active: bool(fd.get("active")), image };
  if (id) await db.update(schema.categories).set(values).where(eq(schema.categories.id, id));
  else await db.insert(schema.categories).values({ ...values, slug: `${slugify(name)}-${Math.random().toString(36).slice(2, 5)}` });
  revalidatePath("/", "layout");
  return { ok: true, message: "تم الحفظ" };
}

/* ---------------- banners ---------------- */
export async function saveBannerAction(_: FormState, fd: FormData): Promise<FormState> {
  await adminOnly();
  const id = str(fd.get("id"));
  const title = str(fd.get("title"));
  if (!title) return { error: "العنوان مطلوب" };
  let image: string | null = null;
  try { image = (await saveUpload(fd.get("imageFile") as File | null)) ?? str(fd.get("image")); } catch (e) { return { error: (e as Error).message }; }
  const values = { title, subtitle: str(fd.get("subtitle")), cta: str(fd.get("cta")) ?? "تسوّق الآن", href: str(fd.get("href")) ?? "/offers", theme: str(fd.get("theme")) ?? "red", sort: int(fd.get("sort")) ?? 0, active: bool(fd.get("active")), image };
  if (id) await db.update(schema.banners).set(values).where(eq(schema.banners.id, id));
  else await db.insert(schema.banners).values(values);
  revalidatePath("/", "layout");
  return { ok: true, message: "تم الحفظ" };
}
export async function deleteBannerAction(id: string) {
  await adminOnly();
  await db.delete(schema.banners).where(eq(schema.banners.id, id));
  revalidatePath("/", "layout");
}

/* ---------------- coupons ---------------- */
export async function saveCouponAction(_: FormState, fd: FormData): Promise<FormState> {
  await adminOnly();
  const code = str(fd.get("code"))?.toUpperCase().replace(/\s/g, "");
  const type = str(fd.get("type")) as "PERCENT" | "FIXED" | "FREE_DELIVERY" | null;
  if (!code || !type) return { error: "الكود والنوع مطلوبين" };
  const exp = str(fd.get("expiresAt"));
  const values = { code, type, value: int(fd.get("value")) ?? 0, minOrder: int(fd.get("minOrder")) ?? 0, maxUses: int(fd.get("maxUses")), expiresAt: exp ? new Date(exp) : null, active: true };
  try { await db.insert(schema.coupons).values(values).onConflictDoUpdate({ target: schema.coupons.code, set: values }); }
  catch { return { error: "تعذّر حفظ الكود" }; }
  revalidatePath("/admin/coupons");
  return { ok: true, message: `تم حفظ الكود ${code}` };
}
export async function toggleCouponAction(id: string, active: boolean) {
  await adminOnly();
  await db.update(schema.coupons).set({ active }).where(eq(schema.coupons.id, id));
  revalidatePath("/admin/coupons");
}

/* ---------------- zones ---------------- */
export async function saveZoneAction(_: FormState, fd: FormData): Promise<FormState> {
  await adminOnly();
  const id = str(fd.get("id"));
  const name = str(fd.get("name"));
  const fee = int(fd.get("fee"));
  if (!name || fee == null) return { error: "اسم المنطقة والأجرة مطلوبين" };
  const values = { name, fee, minutes: int(fd.get("minutes")) ?? 35, active: bool(fd.get("active")), sort: int(fd.get("sort")) ?? 0 };
  try {
    if (id) await db.update(schema.zones).set(values).where(eq(schema.zones.id, id));
    else await db.insert(schema.zones).values(values);
  } catch { return { error: "اسم المنطقة موجود مسبقاً" }; }
  revalidatePath("/admin/zones");
  return { ok: true, message: "تم الحفظ" };
}

/* ---------------- team ---------------- */
export async function saveTeamMemberAction(_: FormState, fd: FormData): Promise<FormState> {
  await adminOnly();
  const id = str(fd.get("id"));
  const name = str(fd.get("name"));
  const phone = normalizePhone(String(fd.get("phone") ?? ""));
  const role = str(fd.get("role")) as Role | null;
  const password = str(fd.get("password"));
  if (!name || phone.length < 11 || !role || !["STAFF", "DRIVER", "ADMIN"].includes(role)) return { error: "أكمل الاسم والرقم والدور" };
  if (!id && (!password || password.length < 6)) return { error: "كلمة المرور 6 أحرف على الأقل" };
  const dup = await db.query.users.findFirst({ where: and(eq(schema.users.phone, phone), id ? ne(schema.users.id, id) : undefined), columns: { id: true } });
  if (dup) return { error: "الرقم مستخدم لحساب آخر" };
  const values = { name, phone, role, vehicle: str(fd.get("vehicle")), active: bool(fd.get("active")), ...(password ? { passwordHash: await hashPassword(password) } : {}) };
  if (id) await db.update(schema.users).set(values).where(eq(schema.users.id, id));
  else await db.insert(schema.users).values({ ...values, passwordHash: values.passwordHash! });
  revalidatePath("/admin/team");
  return { ok: true, message: "تم الحفظ" };
}

export async function adjustPointsAction(userId: string, amount: number) {
  await adminOnly();
  if (!Number.isFinite(amount) || amount === 0) return;
  await db.update(schema.users).set({ points: sql`greatest(${schema.users.points} + ${Math.round(amount)}, 0)` }).where(eq(schema.users.id, userId));
  await db.insert(schema.pointsTx).values({ userId, amount: Math.round(amount), reason: "تعديل يدوي من الإدارة" });
  revalidatePath("/admin/customers");
}

/* ---------------- settings ---------------- */
export async function saveSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  await adminOnly();
  const rate = int(fd.get("usdRate"));
  if (!rate || rate < 1) return { error: "سعر الصرف غير صحيح" };
  await db.update(schema.settings).set({
    storeName: str(fd.get("storeName")) ?? "عمار للتسوق",
    tagline: str(fd.get("tagline")) ?? "",
    phone: str(fd.get("phone")) ?? "",
    whatsapp: String(fd.get("whatsapp") ?? "").replace(/\D/g, ""),
    address: str(fd.get("address")) ?? "",
    usdRate: rate,
    minOrder: int(fd.get("minOrder")) ?? 0,
    freeDeliveryOver: int(fd.get("freeDeliveryOver")) ?? 0,
    pointsPerAmount: Math.max(1, int(fd.get("pointsPerAmount")) ?? 100),
    pointValue: Math.max(0, int(fd.get("pointValue")) ?? 1),
    isOpen: bool(fd.get("isOpen")),
    openHours: str(fd.get("openHours")) ?? "",
    announcement: str(fd.get("announcement")),
    slots: String(fd.get("slots") ?? "").split("\n").map((s) => s.trim()).filter(Boolean).join("|") || "بأسرع وقت",
  }).where(eq(schema.settings.id, 1));
  revalidatePath("/", "layout");
  return { ok: true, message: "تم حفظ الإعدادات" };
}

export async function toggleStoreOpenAction(isOpen: boolean) {
  await guard();
  await db.update(schema.settings).set({ isOpen }).where(eq(schema.settings.id, 1));
  revalidatePath("/", "layout");
}

export async function bulkProductsAction(ids: string[], op: "activate" | "deactivate" | "feature" | "unfeature") {
  await guard();
  if (!ids.length) return;
  const set = op === "activate" ? { active: true } : op === "deactivate" ? { active: false } : op === "feature" ? { featured: true } : { featured: false };
  await db.update(schema.products).set(set).where(inArray(schema.products.id, ids.slice(0, 500)));
  revalidatePath("/", "layout");
}

/** Generates a temporary password for a customer who forgot theirs (sent to them via WhatsApp by the admin). */
export async function resetCustomerPasswordAction(userId: string) {
  await adminOnly();
  const temp = String(Math.floor(100000 + Math.random() * 900000));
  const [u] = await db.update(schema.users).set({ passwordHash: await hashPassword(temp) }).where(and(eq(schema.users.id, userId), eq(schema.users.role, "CUSTOMER"))).returning({ phone: schema.users.phone, name: schema.users.name });
  if (!u) throw new Error("غير موجود");
  return { temp, phone: u.phone, name: u.name };
}

/** After weighing produce, staff enter the real line amount → order totals are recalculated. */
export async function updateWeighedLineAction(orderId: string, itemId: string, lineTotal: number) {
  await guard();
  if (!Number.isFinite(lineTotal) || lineTotal < 0) throw new Error("قيمة غير صحيحة");
  await db.transaction(async (tx) => {
    const [o] = await tx.select().from(schema.orders).where(eq(schema.orders.id, orderId)).for("update");
    if (!o || o.status === "DELIVERED" || o.status === "CANCELLED") throw new Error("لا يمكن التعديل");
    const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
    const it = items.find((i) => i.id === itemId);
    if (!it || !it.grams) throw new Error("ليس منتجاً بالوزن");
    const unitPrice = Math.round(lineTotal / it.qty);
    await tx.update(schema.orderItems).set({ price: unitPrice }).where(eq(schema.orderItems.id, itemId));
    const pointsDiscount = o.subtotal + o.deliveryFee - o.discount - o.total;
    const subtotal = items.reduce((s, i) => s + (i.id === itemId ? unitPrice : i.price) * i.qty, 0);
    await tx.update(schema.orders).set({ subtotal, total: Math.max(0, subtotal + o.deliveryFee - o.discount - pointsDiscount) }).where(eq(schema.orders.id, orderId));
  });
  revalidatePath("/admin", "layout");
}