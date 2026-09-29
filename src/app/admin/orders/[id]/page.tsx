import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { ChevronLeft, MapPin, MessageCircle, Phone, StickyNote, User } from "lucide-react";
import { db, schema } from "@/db";
import { getSettings } from "@/lib/settings";
import { statusMessageForCustomer, waLink } from "@/lib/whatsapp";
import { PAYMENT_LABEL, STATUS } from "@/lib/status";
import { dateAr, prettyPhone, syp } from "@/lib/format";
import { Panel, StatusBadge } from "@/components/admin/Page";
import { OrderActions } from "@/components/admin/OrderActions";
import { WeighedLine } from "@/components/admin/WeighedLine";
import { Mark } from "@/components/ui/Logo";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, drivers, s] = await Promise.all([
    db.query.orders.findFirst({ where: eq(schema.orders.id, id), with: { items: true, zone: true, user: { columns: { points: true, id: true } }, driver: { columns: { name: true, phone: true } }, events: { orderBy: asc(schema.orderEvents.createdAt) } } }),
    db.select({ id: schema.users.id, name: schema.users.name }).from(schema.users).where(and(eq(schema.users.role, "DRIVER"), eq(schema.users.active, true))),
    getSettings(),
  ]);
  if (!order) notFound();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const pointsDiscount = order.subtotal + order.deliveryFee - order.discount - order.total;

  return (
    <div>
      <nav className="mb-4 flex items-center gap-1 text-sm font-bold text-ink-mute no-print"><Link href="/admin/orders" className="hover:text-ink">الطلبات</Link><ChevronLeft className="h-4 w-4" /><span dir="ltr">{order.code}</span></nav>

      {/* Printable invoice header */}
      <div className="mb-6 hidden items-center justify-between border-b-2 border-brand-600 pb-4 print:flex">
        <div className="flex items-center gap-3"><Mark className="h-14 w-14" /><div><div className="text-2xl font-black text-brand-600">{s.storeName}</div><div className="text-xs">{s.address} · {s.phone}</div></div></div>
        <div className="text-left"><div className="text-xl font-black" dir="ltr">{order.code}</div><div className="text-xs">{dateAr(order.createdAt)}</div></div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div><h1 className="text-3xl font-black" dir="ltr">{order.code}</h1><p className="text-sm text-ink-mute">{dateAr(order.createdAt)} · {order.slot}</p></div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Panel title={`المنتجات (${order.items.length})`}>
            <table className="w-full text-sm">
              <thead className="text-xs text-ink-mute"><tr><th className="pb-2 text-right">المنتج</th><th className="pb-2">الكمية</th><th className="pb-2">السعر</th><th className="pb-2 text-left">المجموع</th></tr></thead>
              <tbody className="divide-y divide-ink-line">
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-3"><div className="font-bold">{it.name}</div><div className="text-xs text-ink-mute">{it.unit}{it.grams ? " · تقديري" : ""}</div>
                      {it.grams ? <WeighedLine orderId={order.id} itemId={it.id} value={it.price * it.qty} editable={!["DELIVERED", "CANCELLED"].includes(order.status)} /> : null}</td>
                    <td className="py-3 text-center text-lg font-black tabular">{it.qty}</td>
                    <td className="py-3 text-center tabular">{syp(it.price)}</td>
                    <td className="py-3 text-left font-black tabular">{syp(it.price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 space-y-1.5 border-t border-dashed border-ink-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink-mute">المجموع</dt><dd className="font-bold tabular">{syp(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-mute">التوصيل ({order.zone.name})</dt><dd className="font-bold tabular">{order.deliveryFee ? syp(order.deliveryFee) : "مجاني"}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>خصم {order.couponCode}</dt><dd className="font-bold tabular">-{syp(order.discount)}</dd></div>}
              {order.pointsUsed > 0 && <div className="flex justify-between text-emerald-700"><dt>نقاط ({order.pointsUsed})</dt><dd className="font-bold tabular">-{syp(pointsDiscount)}</dd></div>}
              <div className="flex justify-between pt-2 text-xl font-black"><dt>الإجمالي</dt><dd className="tabular">{syp(order.total)}</dd></div>
              <div className="flex justify-between text-xs text-ink-mute"><dt>{PAYMENT_LABEL[order.payment]}</dt><dd className="tabular">≈ ${(order.total / order.usdRate).toFixed(2)} (سعر {order.usdRate})</dd></div>
            </dl>
          </Panel>

          <Panel title="سجل الطلب" className="print:hidden">
            <ol className="space-y-3">
              {order.events.map((e) => (
                <li key={e.id} className="flex items-center gap-3 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS[e.status].dot}`} />
                  <span className="font-bold">{STATUS[e.status].label}</span>
                  <span className="text-xs text-ink-mute">{e.note}</span>
                  <span className="mr-auto text-xs text-ink-mute">{dateAr(e.createdAt)}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="order-first space-y-4 lg:order-none">
          <Panel className="no-print"><OrderActions id={order.id} status={order.status} driverId={order.driverId} drivers={drivers} /></Panel>
          <Panel title="الزبون">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2"><User className="h-4 w-4 text-brand-600" /><b>{order.customerName}</b>{order.user && <span className="chip bg-brand-50 text-brand-700 ring-brand-200">{order.user.points} نقطة</span>}</li>
              <li className="flex gap-2"><Phone className="h-4 w-4 text-brand-600" /><a href={`tel:+${order.phone}`} dir="ltr" className="font-bold hover:text-brand-600">{prettyPhone(order.phone)}</a></li>
              <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand-600" /><span><b>{order.zone.name}</b> — {order.addressText}</span></li>
              {order.notes && <li className="flex gap-2 rounded-xl bg-amber-50 p-3 text-amber-900"><StickyNote className="h-4 w-4 shrink-0" />{order.notes}</li>}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2 no-print">
              <a href={waLink(order.phone, statusMessageForCustomer(order, site))} target="_blank" rel="noreferrer" className="btn-sm btn h-11 bg-[#25D366] text-white"><MessageCircle className="h-4 w-4" /> واتساب</a>
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(`${order.zone.name} ${order.addressText} حلب`)}`} target="_blank" rel="noreferrer" className="btn-ghost btn-sm h-11"><MapPin className="h-4 w-4" /> الخريطة</a>
            </div>
          </Panel>
          {order.driver && <Panel title="السائق"><div className="flex items-center justify-between text-sm"><b>{order.driver.name}</b><a href={`tel:+${order.driver.phone}`} dir="ltr" className="font-bold text-brand-600">{prettyPhone(order.driver.phone)}</a></div>
            <div className="mt-2 text-xs text-ink-mute">{order.cashCollected ? "✓ تم استلام المبلغ" : "المبلغ لم يُستلم بعد"}</div></Panel>}
          {order.rating && <Panel title="تقييم الزبون"><div className="text-2xl text-amber-400">{"★".repeat(order.rating)}<span className="text-zinc-300">{"★".repeat(5 - order.rating)}</span></div></Panel>}
        </div>
      </div>
    </div>
  );
}
