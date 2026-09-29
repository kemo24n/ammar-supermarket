import { requireRole } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageHead, Panel } from "@/components/admin/Page";
import { CouponForm } from "@/components/admin/CrudForms";
import { CouponToggle } from "@/components/admin/CouponToggle";
import { dateAr, num } from "@/lib/format";

export const metadata = { title: "أكواد الخصم" };

export default async function Coupons() {
  await requireRole(["ADMIN"], "/admin");
  const rows = await db.select().from(schema.coupons).orderBy(desc(schema.coupons.createdAt));
  const label = (t: string, v: number) => (t === "PERCENT" ? `${v}%` : t === "FIXED" ? `${num(v)} ل.س` : "توصيل مجاني");
  return (
    <div>
      <PageHead title="أكواد الخصم" sub="أكواد للمواسم، للمؤثرين، أو لتشجيع الطلب الأول" />
      <Panel title="كود جديد / تعديل كود موجود" className="mb-6"><CouponForm /></Panel>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-paper/70 text-right text-xs text-ink-mute"><tr>{["الكود", "الخصم", "أقل طلب", "الاستخدام", "ينتهي", "الحالة"].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-ink-line">
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-black" dir="ltr">{c.code}</td>
                <td className="px-4 py-3 font-bold">{label(c.type, c.value)}</td>
                <td className="px-4 py-3 tabular">{num(c.minOrder)}</td>
                <td className="px-4 py-3 tabular">{c.used}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                <td className="px-4 py-3 text-xs">{c.expiresAt ? dateAr(c.expiresAt, false) : "—"}</td>
                <td className="px-4 py-3"><CouponToggle id={c.id} active={c.active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
