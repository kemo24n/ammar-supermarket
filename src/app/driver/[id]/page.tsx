import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChevronRight, MapPin, MessageCircle, Navigation, Phone, StickyNote } from "lucide-react";
import { db, schema } from "@/db";
import { requireRole } from "@/lib/auth";
import { StatusBadge } from "@/components/admin/Page";
import { DriverActions } from "@/components/admin/DriverActions";
import { PAYMENT_LABEL } from "@/lib/status";
import { prettyPhone, syp } from "@/lib/format";

export default async function DriverOrder({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole(["DRIVER", "ADMIN"], "/staff-login");
  const { id } = await params;
  const o = await db.query.orders.findFirst({ where: eq(schema.orders.id, id), with: { zone: true, items: true } });
  if (!o || (u.role === "DRIVER" && o.driverId !== u.id)) notFound();
  const usd = o.payment === "COD_USD" ? ` ($${(o.total / o.usdRate).toFixed(2)})` : "";
  const maps = `https://www.google.com/maps/search/${encodeURIComponent(`${o.zone.name} ${o.addressText} حلب`)}`;
  return (
    <div className="space-y-4 pb-10">
      <Link href="/driver" className="flex items-center gap-1 text-sm font-bold text-ink-mute"><ChevronRight className="h-4 w-4" /> رجوع</Link>
      <div className="card p-5">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-black" dir="ltr">{o.code}</h1><StatusBadge status={o.status} /></div>
        <div className="mt-4 rounded-2xl bg-ink p-4 text-white"><div className="text-xs font-bold text-white/60">المطلوب تحصيله</div><div className="text-3xl font-black tabular">{syp(o.total)}<span className="text-lg">{usd}</span></div><div className="mt-1 text-xs text-white/70">{PAYMENT_LABEL[o.payment]}</div></div>
      </div>
      <div className="card space-y-3 p-5">
        <div className="text-lg font-black">{o.customerName}</div>
        <div className="flex gap-2 text-sm"><MapPin className="h-5 w-5 shrink-0 text-brand-600" /><span><b>{o.zone.name}</b> — {o.addressText}</span></div>
        {o.notes && <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><StickyNote className="h-4 w-4 shrink-0" />{o.notes}</div>}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <a href={`tel:+${o.phone}`} className="btn h-14 flex-col gap-0.5 bg-paper text-xs"><Phone className="h-5 w-5" />اتصال</a>
          <a href={`https://wa.me/${o.phone}?text=${encodeURIComponent(`مرحباً ${o.customerName}، معك سائق عمار للتسوق، أنا بالطريق لعندك بطلبك ${o.code}`)}`} target="_blank" rel="noreferrer" className="btn h-14 flex-col gap-0.5 bg-[#25D366]/10 text-xs text-emerald-700"><MessageCircle className="h-5 w-5" />واتساب</a>
          <a href={maps} target="_blank" rel="noreferrer" className="btn h-14 flex-col gap-0.5 bg-sky-50 text-xs text-sky-700"><Navigation className="h-5 w-5" />الخريطة</a>
        </div>
        <div className="text-center text-xs text-ink-mute" dir="ltr">{prettyPhone(o.phone)}</div>
      </div>
      <div className="card p-5">
        <h2 className="mb-2 font-black">المنتجات ({o.items.reduce((s, i) => s + i.qty, 0)} قطعة)</h2>
        <ul className="divide-y divide-ink-line text-sm">{o.items.map((i) => <li key={i.id} className="flex justify-between py-2"><span>{i.name} <span className="text-ink-mute">({i.unit})</span></span><b className="tabular">×{i.qty}</b></li>)}</ul>
      </div>
      <DriverActions id={o.id} status={o.status} total={`${syp(o.total)}${usd}`} />
    </div>
  );
}
