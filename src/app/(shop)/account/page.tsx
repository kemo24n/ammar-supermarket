import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ChevronLeft, Gift, LogOut, MapPin, Package, Trash2 } from "lucide-react";
import { db, schema } from "@/db";
import { requireRole } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { deleteAddressAction } from "@/app/actions/account";
import { getSettings } from "@/lib/settings";
import { orderToken } from "@/lib/token";
import { STATUS } from "@/lib/status";
import { cn, dateAr, num, prettyPhone } from "@/lib/format";
import { Money } from "@/components/shop/Price";
import { ReorderButton } from "@/components/shop/ReorderButton";
import { ProductGrid } from "@/components/shop/Section";
import { listFavorites } from "@/lib/catalog";
import { Heart } from "lucide-react";
import { ChangePassword } from "@/components/shop/ChangePassword";

export const metadata = { title: "حسابي" };

export default async function Account() {
  const u = await requireRole(["CUSTOMER", "ADMIN", "STAFF", "DRIVER"], "/login?next=/account");
  const [orders, addresses, log, s, favs] = await Promise.all([
    db.query.orders.findMany({ where: eq(schema.orders.userId, u.id), orderBy: desc(schema.orders.createdAt), limit: 30, with: { items: { columns: { id: true } } } }),
    db.query.addresses.findMany({ where: eq(schema.addresses.userId, u.id), with: { zone: true } }),
    db.query.pointsTx.findMany({ where: eq(schema.pointsTx.userId, u.id), orderBy: desc(schema.pointsTx.createdAt), limit: 8 }),
    getSettings(),
    listFavorites(u.id),
  ]);
  return (
    <div className="container-x py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-black">أهلا {u.name.split(" ")[0]}</h1><p className="text-sm text-ink-mute" dir="ltr">{prettyPhone(u.phone)}</p></div>
        <form action={logoutAction}><button className="btn-ghost btn-sm"><LogOut className="h-4 w-4" /> تسجيل خروج</button></form>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-6 lg:grid lg:grid-cols-[1fr_360px]">
        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Package className="h-5 w-5 text-brand-600" /> طلباتي</h2>
          {orders.length === 0 ? <p className="py-10 text-center text-ink-mute">ما عندك طلبات لسا — <Link href="/" className="font-bold text-brand-600">ابدأ التسوق</Link></p> : (
            <ul className="divide-y divide-ink-line">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/order/${o.code}?t=${orderToken(o.code)}`} className="flex items-center gap-3 py-3.5 hover:opacity-80">
                    <span className={cn("h-2.5 w-2.5 rounded-full", STATUS[o.status].dot)} />
                    <div className="flex-1"><div className="font-black" dir="ltr">{o.code}</div><div className="text-xs text-ink-mute">{dateAr(o.createdAt)} · {o.items.length} منتج</div></div>
                    <span className={cn("chip hidden sm:inline-flex", STATUS[o.status].tone)}>{STATUS[o.status].short}</span>
                    <Money value={o.total} className="font-black" />
                    <ChevronLeft className="h-4 w-4 text-ink-mute" />
                  </Link>
                  {o.status === "DELIVERED" && <ReorderButton code={o.code} compact className="-mt-1 mb-3" />}
                </li>
              ))}
            </ul>
          )}
        </section>
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-brand-600/40 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-sm font-bold text-white/70"><Gift className="h-4 w-4" /> نقاط عمار</div>
              <div className="mt-2 text-5xl font-black tabular">{num(u.points)}</div>
              <div className="mt-1 text-sm text-white/70">تساوي <Money value={u.points * s.pointValue} className="font-black text-white" /> خصم</div>
              <ul className="mt-5 space-y-2 text-xs">
                {log.map((l) => <li key={l.id} className="flex justify-between text-white/80"><span>{l.reason}</span><span className={cn("font-black tabular", l.amount > 0 ? "text-emerald-400" : "text-brand-400")}>{l.amount > 0 ? "+" : ""}{l.amount}</span></li>)}
              </ul>
            </div>
          </section>
          <ChangePassword />
          <section className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-black"><MapPin className="h-5 w-5 text-brand-600" /> عناويني</h2>
            {addresses.length === 0 ? <p className="text-sm text-ink-mute">رح ينحفظ عنوانك تلقائياً مع أول طلب.</p> : (
              <ul className="space-y-2">
                {addresses.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-2 rounded-2xl bg-paper p-3 text-sm">
                    <span><b>{a.label} · {a.zone.name}</b><br /><span className="text-ink-mute">{a.street}{a.building ? `، بناء ${a.building}` : ""}</span></span>
                    <form action={deleteAddressAction.bind(null, a.id)}><button className="text-ink-mute hover:text-brand-600" aria-label="حذف العنوان"><Trash2 className="h-4 w-4" /></button></form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Heart className="h-5 w-5 fill-brand-600 text-brand-600" /> المفضلة</h2>
        {favs.length ? <ProductGrid products={favs} /> : <p className="card p-6 text-center text-sm text-ink-mute">اضغط على القلب ♡ بأي منتج ليتحفظ هون وتلاقيه بسرعة.</p>}
      </section>
    </div>
  );
}
