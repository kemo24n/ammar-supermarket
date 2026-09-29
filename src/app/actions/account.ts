"use server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { checkPassword, getSession, hashPassword } from "@/lib/auth";

export async function deleteAddressAction(id: string) {
  const s = await getSession();
  if (!s) return;
  await db.delete(schema.addresses).where(and(eq(schema.addresses.id, id), eq(schema.addresses.userId, s.uid)));
  revalidatePath("/account");
}

export async function changePasswordAction(_: { error?: string; message?: string } | undefined, fd: FormData) {
  const s = await getSession();
  if (!s) return { error: "سجّل دخول أولاً" };
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  if (next.length < 6) return { error: "كلمة المرور الجديدة 6 أحرف على الأقل" };
  const u = await db.query.users.findFirst({ where: eq(schema.users.id, s.uid) });
  if (!u || !(await checkPassword(current, u.passwordHash))) return { error: "كلمة المرور الحالية غير صحيحة" };
  await db.update(schema.users).set({ passwordHash: await hashPassword(next) }).where(eq(schema.users.id, s.uid));
  return { message: "تم تغيير كلمة المرور ✓" };
}
