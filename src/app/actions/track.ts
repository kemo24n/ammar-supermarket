"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { normalizePhone } from "@/lib/format";
import { orderToken } from "@/lib/token";
import { clientIp, hit } from "@/lib/ratelimit";

export async function trackAction(_: { error?: string } | undefined, fd: FormData) {
  const code = String(fd.get("code") ?? "").trim().toUpperCase().replace(/^AM(\d)/, "AM-$1");
  const phone = normalizePhone(String(fd.get("phone") ?? ""));
  if (!hit(`track:${await clientIp()}`, 15, 10 * 60_000)) return { error: "محاولات كتيرة — جرّب بعد شوي" };
  const o = await db.query.orders.findFirst({ where: eq(schema.orders.code, code), columns: { code: true, phone: true } });
  if (!o || o.phone !== phone) return { error: "ما لقينا طلب بهالرقم وهالموبايل — تأكد من المعلومات" };
  redirect(`/order/${o.code}?t=${orderToken(o.code)}`);
}
