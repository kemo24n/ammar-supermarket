"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { checkPassword, endSession, hashPassword, startSession } from "@/lib/auth";
import { normalizePhone } from "@/lib/format";
import { clientIp, hit } from "@/lib/ratelimit";

export type AuthState = { error?: string } | undefined;

const safeNext = (n: FormDataEntryValue | null, fallback: string) => {
  const v = typeof n === "string" ? n : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback;
};

export async function loginAction(_: AuthState, fd: FormData): Promise<AuthState> {
  const phone = normalizePhone(String(fd.get("phone") ?? ""));
  const password = String(fd.get("password") ?? "");
  if (phone.length < 11 || !password) return { error: "أدخل رقم الموبايل وكلمة المرور" };
  const ip = await clientIp();
  if (!hit(`login:${ip}`, 20, 10 * 60_000) || !hit(`login:${phone}`, 8, 10 * 60_000)) return { error: "محاولات كتيرة — جرّب بعد 10 دقائق" };
  const u = await db.query.users.findFirst({ where: eq(schema.users.phone, phone) });
  if (!u || !u.active || !(await checkPassword(password, u.passwordHash))) return { error: "الرقم أو كلمة المرور غير صحيحة" };
  await startSession(u);
  const home = u.role === "ADMIN" || u.role === "STAFF" ? "/admin" : u.role === "DRIVER" ? "/driver" : "/account";
  redirect(safeNext(fd.get("next"), home));
}

const RegisterSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسمك").max(60),
  phone: z.string().min(9, "رقم الموبايل غير صحيح"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل").max(100),
});

export async function registerAction(_: AuthState, fd: FormData): Promise<AuthState> {
  const parsed = RegisterSchema.safeParse({ name: fd.get("name"), phone: fd.get("phone"), password: fd.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const phone = normalizePhone(parsed.data.phone);
  if (!/^9639\d{8}$/.test(phone)) return { error: "أدخل رقم موبايل سوري صحيح (09xxxxxxxx)" };
  if (!hit(`register:${await clientIp()}`, 5, 60 * 60_000)) return { error: "محاولات كتيرة — جرّب لاحقاً" };
  const exists = await db.query.users.findFirst({ where: eq(schema.users.phone, phone), columns: { id: true } });
  if (exists) return { error: "هذا الرقم مسجّل مسبقاً — سجّل دخول" };
  const [u] = await db.insert(schema.users).values({ name: parsed.data.name, phone, passwordHash: await hashPassword(parsed.data.password), points: 20 }).returning();
  await db.insert(schema.pointsTx).values({ userId: u.id, amount: 20, reason: "هدية الترحيب" });
  await startSession(u);
  redirect(safeNext(fd.get("next"), "/account"));
}

export async function logoutAction() {
  await endSession();
  redirect("/");
}
