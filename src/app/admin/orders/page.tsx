import Link from "next/link";
import { and, count, desc, eq, gte, ilike, or } from "drizzle-orm";
import { Search } from "lucide-react";
import { db, schema } from "@/db";
import type { OrderStatus } from "@/db/schema";
import { PageHead, StatusBadge } from "@/components/admin/Page";
import { cn, prettyPhone, syp, timeAgo } from "@/lib/format";
import { STATUS } from "@/lib/status";

export const metadata = { title: "الطلبات" };

const TABS: (OrderStatus | "ALL")[] = ["ALL", "PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; range?: string }> }) {
  const sp = await searchParams;
  const status = (TABS.includes(sp.status as OrderStatus) ? sp.status : "ALL") as OrderStatus | "ALL";
  const q = (sp.q ?? "").trim();
  const o = schema.orders;
  const since = sp.range === "today" ? new Date(Date.now() - 86400000) : sp.range === "week" ? new Date(Date.now() - 7 * 86400000) : undefined;
  const where = and(
    status !== "ALL" ? eq(o.status, status) : undefined,
    q ? or(ilike(o.code, `%${q}%`), ilike(o.customerName, `%${q}%`), ilike(o.phone, `%${q.replace(/^0/, "")}%`)) : undefined,
    since ? gte(o.createdAt, since) : undefined,
  );
  const [rows, counts] = await Promise.all([
    db.query.orders.findMany({ where, orderBy: desc(o.createdAt), limit: 150, with: { zone: { columns: { name: true } }, driver: { columns: { name: true } }, items: { columns: { id: true } } } }),
    db.select({ status: o.status, n: count() }).from(o).groupBy(o.status),
  ]);
  const cnt = (s: OrderStatus | "ALL") => (s === "ALL" ? counts.reduce((a, c) => a + c.n, 0) : counts.find((c) => c.status === s)?.n ?? 0);
  const href = (p: Record<string, string | undefined>) => `/admin/orders?${new URLSearchParams(Object.entries({ status, q, range: sp.range, ...p }).filter(([, v]) => v && v !== "ALL") as [string, string][])}`;

  return (
    <div>
      <PageHead title="الطلبات" sub="تحديث تلقائي كل 20 ثانية — وتنبيه صوتي عند وصول طلب جديد" />
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link key={t} href={href({ status: t })} className={cn("flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold ring-1 transition", status === t ? "bg-ink text-white ring-ink" : "bg-white ring-ink-line hover:ring-ink/30")}>
            {t === "ALL" ? "الكل" : STATUS[t].short}
            <span className={cn("rounded-md px-1.5 text-xs font-black", status === t ? "bg-white/20" : t === "PENDING" && cnt(t) > 0 ? "bg-brand-600 text-white" : "bg-paper")}>{cnt(t)}</span>
          </Link>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <form className="relative min-w-[240px] flex-1" action="/admin/orders">
          <input type="hidden" name="status" value={status === "ALL" ? "" : status} />
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input name="q" defaultValue={q} placeholder="ابحث برقم الطلب، الاسم أو الموبايل" className="input h-11 pr-10" />
        </form>
        {[["", "كل الأوقات"], ["today", "آخر 24 ساعة"], ["week", "آخر 7 أيام"]].map(([k, l]) => (
          <Link key={k} href={href({ range: k })} className={cn("rounded-xl px-3.5 py-2.5 text-sm font-bold ring-1", (sp.range ?? "") === k ? "bg-brand-600 text-white ring-brand-600" : "bg-white ring-ink-line")}>{l}</Link>
        ))}
      </div>
      {/* Phone: cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((r) => (
          <Link key={r.id} href={`/admin/orders/${r.id}`} className={cn("card block p-4 active:scale-[.99]", r.status === "PENDING" && "ring-2 ring-amber-300")}>
            <div className="flex items-center justify-between"><span className="text-lg font-black" dir="ltr">{r.code}</span><StatusBadge status={r.status} /></div>
            <div className="mt-2 flex items-center justify-between text-sm"><span className="font-bold">{r.customerName}</span><span className="font-black tabular">{syp(r.total)}</span></div>
            <div className="mt-1 flex items-center justify-between text-xs text-ink-mute"><span>{r.zone.name} · {r.items.length} منتج</span><span>{timeAgo(r.createdAt)}</span></div>
            {r.driver && <div className="mt-2 text-xs font-bold text-ink-soft">السائق: {r.driver.name}</div>}
          </Link>
        ))}
        {rows.length === 0 && <p className="card p-10 text-center text-ink-mute">لا توجد طلبات مطابقة</p>}
      </div>
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-paper/70 text-right text-xs text-ink-mute">
            <tr>{["الطلب", "الزبون", "المنطقة", "المنتجات", "السائق", "الحالة", "الإجمالي"].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-ink-line">
            {rows.map((r) => (
              <tr key={r.id} className={cn("transition hover:bg-paper/60", r.status === "PENDING" && "bg-amber-50/40")}>
                <td className="px-4 py-3"><Link href={`/admin/orders/${r.id}`} className="font-black text-ink hover:text-brand-600" dir="ltr">{r.code}</Link><div className="text-xs text-ink-mute">{timeAgo(r.createdAt)} · {r.slot}</div></td>
                <td className="px-4 py-3"><div className="font-bold">{r.customerName}</div><div className="text-xs text-ink-mute" dir="ltr">{prettyPhone(r.phone)}</div></td>
                <td className="px-4 py-3 font-bold">{r.zone.name}</td>
                <td className="px-4 py-3 tabular">{r.items.length}</td>
                <td className="px-4 py-3 text-xs">{r.driver?.name ?? <span className="text-ink-mute">—</span>}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-left"><div className="font-black tabular">{syp(r.total)}</div><div className="text-[11px] text-ink-mute">{r.payment === "COD_USD" ? "دولار" : "ليرة"}</div></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="py-16 text-center text-ink-mute">لا توجد طلبات مطابقة</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
