import Link from "next/link";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { Banknote, Bike, ChevronLeft, MapPin, PackageCheck } from "lucide-react";
import { db, schema } from "@/db";
import { requireRole } from "@/lib/auth";
import { StatusBadge } from "@/components/admin/Page";
import { syp, timeAgo } from "@/lib/format";

export default async function DriverHome() {
  const u = await requireRole(["DRIVER", "ADMIN"], "/staff-login");
  const since = new Date(Date.now() - 18 * 3600000);
  const [active, done] = await Promise.all([
    db.query.orders.findMany({ where: and(eq(schema.orders.driverId, u.id), inArray(schema.orders.status, ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"])), orderBy: desc(schema.orders.createdAt), with: { zone: true, items: { columns: { id: true } } } }),
    db.query.orders.findMany({ where: and(eq(schema.orders.driverId, u.id), eq(schema.orders.status, "DELIVERED"), gte(schema.orders.updatedAt, since)), columns: { total: true, payment: true, usdRate: true } }),
  ]);
  const cash = done.reduce((s, o) => s + o.total, 0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-brand-600 p-5 text-white"><Bike className="h-6 w-6 opacity-80" /><div className="mt-2 text-3xl font-black">{active.length}</div><div className="text-sm font-bold opacity-80">طلبات حالية</div></div>
        <div className="rounded-3xl bg-white p-5 shadow-card"><Banknote className="h-6 w-6 text-emerald-600" /><div className="mt-2 text-xl font-black tabular">{syp(cash)}</div><div className="text-sm font-bold text-ink-mute">كاش اليوم ({done.length} توصيلة)</div></div>
      </div>
      <h1 className="text-xl font-black">طلباتي</h1>
      {active.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center"><PackageCheck className="h-10 w-10 text-emerald-500" /><b>ما في طلبات حالياً</b><span className="text-sm text-ink-mute">رح تظهر هون أول ما الإدارة تسلّمك طلب</span></div>
      ) : active.map((o) => (
        <Link key={o.id} href={`/driver/${o.id}`} className="card block p-5 transition active:scale-[.99]">
          <div className="flex items-center justify-between"><span className="text-lg font-black" dir="ltr">{o.code}</span><StatusBadge status={o.status} /></div>
          <div className="mt-3 flex items-start gap-2 text-sm"><MapPin className="h-4 w-4 shrink-0 text-brand-600" /><span><b>{o.zone.name}</b> — {o.addressText}</span></div>
          <div className="mt-3 flex items-center justify-between border-t border-ink-line pt-3 text-sm">
            <span className="text-ink-mute">{o.items.length} منتج · {timeAgo(o.createdAt)}</span>
            <span className="flex items-center gap-1 font-black">{syp(o.total)} <ChevronLeft className="h-4 w-4" /></span>
          </div>
        </Link>
      ))}
    </div>
  );
}
