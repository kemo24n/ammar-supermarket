import Link from "next/link";
import { and, asc, desc, eq, gte, lte, ne, or, sql, sum, count } from "drizzle-orm";
import { AlertTriangle, ArrowLeft, Banknote, ClipboardList, ShoppingBasket, Star, TrendingUp } from "lucide-react";
import { db, schema } from "@/db";
import { getSettings } from "@/lib/settings";
import { PageHead, Panel, StatusBadge } from "@/components/admin/Page";
import { SalesChart } from "@/components/admin/SalesChart";
import { StoreSwitch } from "@/components/admin/StoreSwitch";
import { num, syp, timeAgo } from "@/lib/format";
import { STATUS } from "@/lib/status";

export const metadata = { title: "لوحة التحكم" };

function startOfDay(d = new Date()) {
  // Syria is UTC+3 all year.
  const x = new Date(d.getTime() + 3 * 3600000); x.setUTCHours(0, 0, 0, 0);
  return new Date(x.getTime() - 3 * 3600000);
}

export default async function Dashboard() {
  const o = schema.orders;
  const today = startOfDay();
  const from = new Date(today.getTime() - 13 * 86400000);
  const notCancelled = ne(o.status, "CANCELLED");
  const [s, [t], [y], byStatus, daily, top, low, latest, [rating]] = await Promise.all([
    getSettings(),
    db.select({ n: count(), rev: sum(o.total) }).from(o).where(and(gte(o.createdAt, today), notCancelled)),
    db.select({ n: count(), rev: sum(o.total) }).from(o).where(and(gte(o.createdAt, new Date(today.getTime() - 86400000)), lte(o.createdAt, today), notCancelled)),
    db.select({ status: o.status, n: count() }).from(o).where(gte(o.createdAt, today)).groupBy(o.status),
    db.select({ day: sql<string>`to_char(${o.createdAt} at time zone 'Asia/Damascus', 'MM-DD')`, revenue: sql<number>`coalesce(sum(${o.total}),0)::int`, orders: sql<number>`count(*)::int` })
      .from(o).where(and(gte(o.createdAt, from), notCancelled)).groupBy(sql`1`).orderBy(sql`1`),
    db.select({ name: schema.orderItems.name, qty: sql<number>`sum(${schema.orderItems.qty})::int`, rev: sql<number>`sum(${schema.orderItems.qty} * ${schema.orderItems.price})::int` })
      .from(schema.orderItems).innerJoin(o, eq(o.id, schema.orderItems.orderId)).where(and(gte(o.createdAt, from), notCancelled))
      .groupBy(schema.orderItems.name).orderBy(desc(sql`2`)).limit(6),
    db.select({ id: schema.products.id, name: schema.products.name, stock: schema.products.stock, unit: schema.products.unit, soldBy: schema.products.soldBy })
      .from(schema.products).where(and(eq(schema.products.active, true), or(and(eq(schema.products.soldBy, "unit"), lte(schema.products.stock, 10)), and(eq(schema.products.soldBy, "weight"), lte(schema.products.stock, 3000)))))
      .orderBy(asc(schema.products.stock)).limit(6),
    db.query.orders.findMany({ orderBy: desc(o.createdAt), limit: 7, with: { zone: { columns: { name: true } } } }),
    db.select({ avg: sql<number>`coalesce(avg(${o.rating}),0)::float`, n: sql<number>`count(${o.rating})::int` }).from(o),
  ]);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(from.getTime() + i * 86400000 + 3 * 3600000);
    const key = `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const row = daily.find((r) => r.day === key);
    return { day: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`, revenue: row?.revenue ?? 0, orders: row?.orders ?? 0 };
  });
  const revToday = Number(t.rev ?? 0), revY = Number(y.rev ?? 0);
  const delta = revY ? Math.round(((revToday - revY) / revY) * 100) : 0;
  const pending = byStatus.find((b) => b.status === "PENDING")?.n ?? 0;
  const total14 = days.reduce((a, d) => a + d.revenue, 0);

  const kpis = [
    { label: "مبيعات اليوم", value: syp(revToday), sub: revY ? `${delta >= 0 ? "+" : ""}${delta}% عن مبارح` : "—", Icon: Banknote, tone: "bg-brand-600 text-white" },
    { label: "طلبات اليوم", value: num(t.n), sub: `${pending} بانتظار التأكيد`, Icon: ClipboardList, tone: "bg-ink text-white" },
    { label: "متوسط السلة", value: syp(t.n ? revToday / t.n : 0), sub: `≈ $${(t.n ? revToday / t.n / s.usdRate : 0).toFixed(1)}`, Icon: ShoppingBasket, tone: "bg-white" },
    { label: "تقييم الزبائن", value: rating.n ? rating.avg.toFixed(1) : "—", sub: `${rating.n} تقييم`, Icon: Star, tone: "bg-white" },
  ];

  return (
    <div>
      <PageHead title="لوحة التحكم" sub="نظرة سريعة على أداء عمار للتسوق اليوم" actions={<><StoreSwitch isOpen={s.isOpen} /><Link href="/admin/orders" className="btn-dark h-11 text-sm">الطلبات <ArrowLeft className="h-4 w-4" /></Link></>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(({ label, value, sub, Icon, tone }) => (
          <div key={label} className={`relative overflow-hidden rounded-3xl p-5 shadow-card ring-1 ring-black/[.03] ${tone}`}>
            {tone.includes("brand") && <div className="stripes absolute inset-0 opacity-40" />}
            <div className="relative">
              <div className="flex items-center justify-between"><span className="text-sm font-bold opacity-80">{label}</span><Icon className="h-5 w-5 opacity-70" /></div>
              <div className="mt-3 text-2xl font-black tabular sm:text-3xl">{value}</div>
              <div className="mt-1 text-xs font-bold opacity-70">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="المبيعات — آخر 14 يوم" className="xl:col-span-2" actions={<span className="flex items-center gap-1 text-sm font-bold text-ink-mute"><TrendingUp className="h-4 w-4 text-emerald-600" /> {syp(total14)}</span>}>
          <SalesChart data={days} />
        </Panel>
        <Panel title="طلبات اليوم حسب الحالة">
          <ul className="space-y-3">
            {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((k) => {
              const n = byStatus.find((b) => b.status === k)?.n ?? 0;
              const max = Math.max(1, ...byStatus.map((b) => b.n));
              return (
                <li key={k}>
                  <div className="mb-1 flex justify-between text-sm"><span className="font-bold">{STATUS[k].label}</span><span className="font-black tabular">{n}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper"><div className={`h-full rounded-full ${STATUS[k].dot}`} style={{ width: `${(n / max) * 100}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="آخر الطلبات" className="xl:col-span-2" actions={<Link href="/admin/orders" className="text-sm font-black text-brand-600">الكل</Link>}>
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <tbody className="divide-y divide-ink-line">
                {latest.map((r) => (
                  <tr key={r.id} className="hover:bg-paper/60">
                    <td className="px-5 py-3"><Link href={`/admin/orders/${r.id}`} className="font-black hover:text-brand-600" dir="ltr">{r.code}</Link><div className="text-xs text-ink-mute">{timeAgo(r.createdAt)}</div></td>
                    <td className="px-2 py-3"><div className="font-bold">{r.customerName}</div><div className="text-xs text-ink-mute">{r.zone.name}</div></td>
                    <td className="px-2 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-left font-black tabular">{syp(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="الأكثر مبيعاً (14 يوم)">
            <ol className="space-y-2.5">
              {top.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3 text-sm">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-paper text-xs font-black">{i + 1}</span>
                  <span className="flex-1 truncate font-bold">{p.name}</span><span className="text-xs text-ink-mute">{p.qty} وحدة</span>
                </li>
              ))}
            </ol>
          </Panel>
          <Panel title="مخزون منخفض" actions={<AlertTriangle className="h-4 w-4 text-amber-500" />}>
            {low.length === 0 ? <p className="text-sm text-ink-mute">كل المنتجات متوفرة بكميات جيدة</p> : (
              <ul className="space-y-2">
                {low.map((p) => (
                  <li key={p.id}><Link href={`/admin/products/${p.id}`} className="flex items-center justify-between rounded-xl bg-paper px-3 py-2 text-sm hover:bg-brand-50">
                    <span className="truncate font-bold">{p.name}</span><span className={`font-black tabular ${p.stock === 0 ? "text-brand-600" : "text-amber-600"}`}>{p.stock === 0 ? "نفد" : p.soldBy === "weight" ? `${p.stock / 1000} كغ` : p.stock}</span>
                  </Link></li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
