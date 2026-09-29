import { requireRole } from "@/lib/auth";
import { desc, eq, ilike, or, and, sql } from "drizzle-orm";
import { Search } from "lucide-react";
import { db, schema } from "@/db";
import { PageHead } from "@/components/admin/Page";
import { PointsAdjust } from "@/components/admin/PointsAdjust";
import { ResetPassword } from "@/components/admin/ResetPassword";
import { dateAr, num, prettyPhone, syp } from "@/lib/format";

export const metadata = { title: "الزبائن" };

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireRole(["ADMIN"], "/admin");
  const q = ((await searchParams).q ?? "").trim();
  const u = schema.users, o = schema.orders;
  const rows = await db.select({
    id: u.id, name: u.name, phone: u.phone, points: u.points, createdAt: u.createdAt,
    orders: sql<number>`count(${o.id}) filter (where ${o.status} <> 'CANCELLED')::int`,
    spent: sql<number>`coalesce(sum(${o.total}) filter (where ${o.status} = 'DELIVERED'), 0)::int`,
    last: sql<Date | null>`max(${o.createdAt})`,
  }).from(u).leftJoin(o, eq(o.userId, u.id))
    .where(and(eq(u.role, "CUSTOMER"), q ? or(ilike(u.name, `%${q}%`), ilike(u.phone, `%${q.replace(/^0/, "")}%`)) : undefined))
    .groupBy(u.id).orderBy(desc(sql`8`), desc(u.createdAt)).limit(300);
  return (
    <div>
      <PageHead title="الزبائن" sub={`${rows.length} زبون مسجّل — مرتبين حسب إجمالي الشراء`} />
      <form className="relative mb-4 max-w-md"><Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><input name="q" defaultValue={q} placeholder="اسم أو رقم موبايل" className="input h-11 pr-10" /></form>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-paper/70 text-right text-xs text-ink-mute"><tr>{["الزبون", "الطلبات", "إجمالي المشتريات", "النقاط", "آخر طلب", "تعديل النقاط", "الحساب"].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-ink-line">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-paper/50">
                <td className="px-4 py-3"><div className="font-bold">{r.name}</div><a href={`https://wa.me/${r.phone}`} target="_blank" rel="noreferrer" className="text-xs text-ink-mute hover:text-emerald-600" dir="ltr">{prettyPhone(r.phone)}</a></td>
                <td className="px-4 py-3 font-black tabular">{r.orders}</td>
                <td className="px-4 py-3 font-black tabular">{syp(r.spent)}</td>
                <td className="px-4 py-3"><span className="chip bg-brand-50 text-brand-700 ring-brand-200">{num(r.points)}</span></td>
                <td className="px-4 py-3 text-xs text-ink-mute">{r.last ? dateAr(r.last) : "—"}</td>
                <td className="px-4 py-3"><PointsAdjust userId={r.id} /></td>
                <td className="px-4 py-3"><ResetPassword userId={r.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
