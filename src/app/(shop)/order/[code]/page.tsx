import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { Bike, Check, CheckCircle2, Clock, MapPin, MessageCircle, Phone, Receipt, X } from "lucide-react";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { checkOrderToken, orderToken } from "@/lib/token";
import { getSettings } from "@/lib/settings";
import { PAYMENT_LABEL, STATUS, STATUS_FLOW } from "@/lib/status";
import { cn, dateAr, prettyPhone } from "@/lib/format";
import { Money } from "@/components/shop/Price";
import { ProductImage } from "@/components/shop/ProductImage";
import { AutoRefresh } from "@/components/shop/AutoRefresh";
import { RateOrder } from "@/components/shop/RateOrder";
import { ReorderButton } from "@/components/shop/ReorderButton";
import { Illus } from "@/components/ui/Illustrations";

export const metadata = { title: "تتبّع الطلب" };

type Props = { params: Promise<{ code: string }>; searchParams: Promise<{ t?: string; new?: string }> };

export default async function OrderPage({ params, searchParams }: Props) {
  const { code } = await params;
  const { t, new: isNew } = await searchParams;
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.code, decodeURIComponent(code)),
    with: { items: true, zone: true, driver: { columns: { name: true, phone: true, vehicle: true } }, events: { orderBy: asc(schema.orderEvents.createdAt) } },
  });
  if (!order) notFound();
  const s = await getSession();
  const allowed = checkOrderToken(order.code, t) || (s && (s.uid === order.userId || ["ADMIN", "STAFF"].includes(s.role) || (s.role === "DRIVER" && s.uid === order.driverId)));
  if (!allowed) notFound();
  const settings = await getSettings();
  const token = orderToken(order.code);
  const cancelled = order.status === "CANCELLED";
  const curIdx = STATUS_FLOW.indexOf(order.status);
  const at = (st: string) => order.events.find((e) => e.status === st)?.createdAt;
  const eta = new Date(order.createdAt.getTime() + (order.zone.minutes + 10) * 60000);
  const waText = `مرحباً عمار للتسوق، بخصوص طلبي رقم ${order.code}`;

  return (
    <div className="container-x py-8">
      {!["DELIVERED", "CANCELLED"].includes(order.status) && <AutoRefresh />}
      {isNew && (
        <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-brand-600 p-6 text-white sm:p-7">
          <div className="stripes absolute inset-0 opacity-50" />
          <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-6 sm:text-right">
            <Illus.Success className="h-40 w-44 shrink-0 sm:h-44 sm:w-48" />
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">وصلنا طلبك! شكراً إلك</h1>
              <p className="mt-2 text-white/85">رقم طلبك <b dir="ltr" className="rounded-lg bg-white/15 px-2 py-0.5">{order.code}</b> — رح يوصلك تأكيد خلال دقائق، وفيك تتابع كل خطوة من هون.</p>
            </div>
          </div>
        </div>
      )}
      {!isNew && order.status === "OUT_FOR_DELIVERY" && (
        <div className="relative mb-6 flex items-center gap-4 overflow-hidden rounded-[2rem] bg-ink p-5 text-white">
          <Illus.Scooter className="h-24 w-36 shrink-0" />
          <div><div className="text-xl font-black">طلبك بالطريق!</div><div className="text-sm text-white/75">{order.driver?.name ?? "السائق"} رايح لعندك هلأ</div></div>
        </div>
      )}
      {order.status === "DELIVERED" && !isNew && (
        <div className="relative mb-6 flex items-center gap-4 overflow-hidden rounded-[2rem] bg-emerald-600 p-5 text-white">
          <Illus.Success className="h-24 w-28 shrink-0" />
          <div><div className="text-xl font-black">وصل طلبك — صحتين وعافية!</div><div className="text-sm text-white/80">شكراً لأنك اخترت عمار للتسوق</div></div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink-mute">طلب رقم</p>
                <h2 className="text-2xl font-black" dir="ltr">{order.code}</h2>
                <p className="mt-1 text-xs text-ink-mute">{dateAr(order.createdAt)}</p>
              </div>
              <span className={cn("chip text-sm", STATUS[order.status].tone)}><span className={cn("h-2 w-2 rounded-full", STATUS[order.status].dot)} />{STATUS[order.status].label}</span>
            </div>
            {!cancelled && order.status !== "DELIVERED" && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-paper p-4">
                <Clock className="h-6 w-6 text-brand-600" />
                <div>
                  <div className="text-xs font-bold text-ink-mute">الوصول المتوقع</div>
                  <div className="font-black">{order.slot === "بأسرع وقت" ? `حوالي ${new Intl.DateTimeFormat("ar-SY-u-nu-latn", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Damascus" }).format(eta)}` : order.slot}</div>
                </div>
              </div>
            )}

            {cancelled ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-zinc-100 p-4 font-bold text-zinc-600"><X className="h-5 w-5" /> تم إلغاء هذا الطلب. للاستفسار تواصل معنا على واتساب.</div>
            ) : (
              <ol className="relative mt-7 space-y-0">
                {STATUS_FLOW.map((st, i) => {
                  const done = i < curIdx || order.status === "DELIVERED";
                  const active = i === curIdx && order.status !== "DELIVERED";
                  const time = at(st);
                  return (
                    <li key={st} className="relative flex gap-4 pb-7 last:pb-0">
                      {i < STATUS_FLOW.length - 1 && <span className={cn("absolute right-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5", i < curIdx ? "bg-brand-600" : "bg-ink-line")} />}
                      <span className={cn("relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ring-4 ring-white", done ? "bg-brand-600 text-white" : active ? "bg-white text-brand-600 ring-brand-100" : "bg-paper text-ink-mute")}>
                        {active && <span className="absolute inset-0 animate-ring rounded-full bg-brand-500/40" />}
                        {done ? <Check className="h-5 w-5" strokeWidth={3} /> : st === "OUT_FOR_DELIVERY" ? <Bike className="h-5 w-5" /> : <span className="text-sm font-black">{i + 1}</span>}
                      </span>
                      <div className="pt-1.5">
                        <div className={cn("font-black", !done && !active && "text-ink-mute")}>{STATUS[st].label}</div>
                        <div className="text-sm text-ink-mute">{active || done ? STATUS[st].desc : ""}{time ? ` · ${dateAr(time)}` : ""}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {order.driver && order.status === "OUT_FOR_DELIVERY" && (
            <section className="card flex items-center gap-4 p-5">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white"><Bike className="h-7 w-7" /></span>
              <div className="flex-1"><div className="text-xs font-bold text-ink-mute">السائق بالطريق</div><div className="text-lg font-black">{order.driver.name}</div><div className="text-xs text-ink-mute">{order.driver.vehicle}</div></div>
              <a href={`tel:+${order.driver.phone}`} className="btn-dark btn-sm h-11"><Phone className="h-4 w-4" /> اتصال</a>
            </section>
          )}

          {order.status === "DELIVERED" && <RateOrder code={order.code} token={token} initial={order.rating} />}

          <section className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black"><Receipt className="h-5 w-5 text-brand-600" /> المنتجات</h3>
            <ul className="divide-y divide-ink-line">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-paper"><ProductImage src={it.image} name={it.name} size={100} /></div>
                  <div className="flex-1"><div className="text-sm font-bold">{it.name}</div><div className="text-xs text-ink-mute">{it.unit} × {it.qty}{it.grams ? " · وزن تقديري" : ""}</div></div>
                  <Money value={it.price * it.qty} className="font-black" />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
          <section className="card space-y-2 p-5 text-sm">
            <div className="flex justify-between"><span className="text-ink-mute">المجموع</span><Money value={order.subtotal} className="font-bold" /></div>
            <div className="flex justify-between"><span className="text-ink-mute">التوصيل</span>{order.deliveryFee ? <Money value={order.deliveryFee} className="font-bold" /> : <span className="font-bold text-emerald-600">مجاني</span>}</div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-700"><span>خصم {order.couponCode}</span><span className="font-bold">-<Money value={order.discount} /></span></div>}
            {order.pointsUsed > 0 && <div className="flex justify-between text-emerald-700"><span>خصم النقاط</span><span className="font-bold">-<Money value={order.subtotal + order.deliveryFee - order.discount - order.total} /></span></div>}
            <div className="flex justify-between border-t border-dashed border-ink-line pt-3 text-lg font-black"><span>الإجمالي</span><Money value={order.total} /></div>
            <div className="rounded-xl bg-paper p-3 text-xs font-bold text-ink-soft">{PAYMENT_LABEL[order.payment]}{order.payment === "COD_USD" && <> · ≈ ${(order.total / order.usdRate).toFixed(2)}</>}</div>
            {order.pointsEarned > 0 && order.userId && <div className="rounded-xl bg-brand-50 p-3 text-xs font-bold text-brand-700">{order.status === "DELIVERED" ? `✓ انضافلك ${order.pointsEarned} نقطة` : `رح تربح ${order.pointsEarned} نقطة بعد التوصيل`}</div>}
          </section>
          <section className="card space-y-3 p-5 text-sm">
            <div className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand-600" /><span><b>{order.zone.name}</b> — {order.addressText}</span></div>
            <div className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-brand-600" /><span dir="ltr">{prettyPhone(order.phone)}</span></div>
            {order.notes && <div className="rounded-xl bg-paper p-3 text-xs">{order.notes}</div>}
          </section>
          <a href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noreferrer" className="btn w-full bg-[#25D366] text-white hover:brightness-95">
            <MessageCircle className="h-5 w-5" /> تواصل معنا واتساب
          </a>
          {["DELIVERED", "CANCELLED"].includes(order.status) && <ReorderButton code={order.code} token={token} />}
          <Link href="/" className="btn-ghost w-full"><CheckCircle2 className="h-5 w-5" /> متابعة التسوق</Link>
        </aside>
      </div>
    </div>
  );
}
