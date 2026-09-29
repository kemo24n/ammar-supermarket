"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AlertTriangle, Banknote, Check, ChevronDown, Clock, DollarSign, Gift, Loader2, MapPin, ShoppingBasket, Tag, User } from "lucide-react";
import { useCart } from "@/store/cart";
import { placeOrderAction, quoteAction } from "@/app/actions/checkout";
import type { Quote } from "@/lib/orders";
import { useMoney, useMounted, useStore } from "./StoreProvider";
import { ProductImage } from "./ProductImage";
import { FreeDeliveryBar } from "./CartDrawer";
import { cn, num } from "@/lib/format";
import { lineKey } from "@/lib/weight";
import { Illus } from "@/components/ui/Illustrations";

type Zone = { id: string; name: string; fee: number; minutes: number };
type Addr = { id: string; label: string; zoneId: string; street: string; building: string; floor: string };

function Step({ n, title, Icon, children }: { n: number; title: string; Icon: typeof User; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-black">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm text-white">{n}</span>
        <Icon className="h-5 w-5 text-ink-mute" /> {title}
      </h2>
      {children}
    </section>
  );
}

export function CheckoutClient({ zones, slots, user, addresses }: { zones: Zone[]; slots: string[]; user: { name: string; phone: string; points: number } | null; addresses: Addr[] }) {
  const router = useRouter();
  const mounted = useMounted();
  const { settings } = useStore();
  const m = useMoney();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const sync = useCart((s) => s.sync);

  const first = addresses[0];
  const [form, setForm] = useState({
    customerName: user?.name ?? "", phone: user?.phone ?? "", zoneId: first?.zoneId ?? "", street: first?.street ?? "",
    building: first?.building ?? "", floor: first?.floor ?? "", notes: "", slot: slots[0] ?? "بأسرع وقت",
    payment: "COD_SYP" as "COD_SYP" | "COD_USD", couponCode: "", usePoints: false, saveAddress: !first,
  });
  const [couponInput, setCouponInput] = useState("");
  const [q, setQ] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placing, startPlacing] = useTransition();
  const [quoting, setQuoting] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const lines = useMemo(() => items.map((i) => ({ id: i.id, qty: i.qty, grams: i.grams ?? null })), [items]);
  useEffect(() => {
    if (!mounted || !lines.length) return;
    let alive = true;
    setQuoting(true);
    const t = setTimeout(async () => {
      try {
        const res = await quoteAction({ items: lines, zoneId: form.zoneId, couponCode: form.couponCode, usePoints: form.usePoints });
        if (!alive) return;
        setQ(res);
        const changed = res.lines.length !== lines.length || res.lines.some((l) => { const c = items.find((i) => i.key === lineKey(l.id, l.grams)); return !c || c.price !== l.price || c.qty !== l.qty; });
        if (changed) sync(res.lines.map((l) => ({ id: l.id, grams: l.grams, qty: l.qty, price: l.price, stock: l.stock })));
      } finally { if (alive) setQuoting(false); }
    }, 250);
    return () => { alive = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, JSON.stringify(lines), form.zoneId, form.couponCode, form.usePoints]);

  if (!mounted) return <div className="container-x py-24 text-center text-ink-mute"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>;
  if (!items.length) {
    return (
      <div className="container-x py-20 text-center">
        <Illus.EmptyBasket className="mx-auto h-48 w-48" />
        <h1 className="mt-5 text-2xl font-black">سلتك فاضية</h1>
        <p className="mt-2 text-ink-mute">ضيف منتجات وارجع لهون لتكمّل طلبك</p>
        <Link href="/" className="btn-primary mt-6">تسوّق الآن</Link>
      </div>
    );
  }

  const couponProblem = q?.problems.find((p) => p.includes("كود"));
  const blocking = q?.problems.filter((p) => !p.startsWith("الكمية المتوفرة") && !p.includes("كود")) ?? [];
  const zone = zones.find((z) => z.id === form.zoneId);

  const submit = () => {
    setError(null);
    if (!form.zoneId) return setError("اختر منطقة التوصيل");
    startPlacing(async () => {
      const res = await placeOrderAction({ ...form, items: lines, couponCode: q?.coupon ? form.couponCode : undefined });
      if (!res.ok) { setError(res.error); return; }
      clear();
      router.push(`/order/${res.code}?t=${res.token}&new=1`);
    });
  };

  return (
    <div className="container-x py-6 pb-32 lg:py-8 lg:pb-8">
      <h1 className="text-3xl font-black">إتمام الطلب</h1>
      <p className="mt-1 text-ink-mute">خطوات بسيطة وطلبك بيكون بالطريق</p>
      {!user && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink p-4 text-white">
          <span className="flex items-center gap-2 text-sm font-bold"><Gift className="h-5 w-5 text-brand-400" /> سجّل دخول لتجمع نقاط على هالطلب وتتابع طلباتك بسهولة</span>
          <Link href="/login?next=/checkout" className="btn-sm btn bg-white text-ink">دخول / حساب جديد</Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <Step n={1} title="معلوماتك" Icon={User}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="cn">الاسم</label><input id="cn" className="input" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} autoComplete="name" /></div>
              <div><label className="label" htmlFor="ph">رقم الموبايل</label><input id="ph" className="input text-left" dir="ltr" inputMode="tel" placeholder="09xx xxx xxx" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></div>
            </div>
          </Step>

          <Step n={2} title="عنوان التوصيل" Icon={MapPin}>
            {addresses.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {addresses.map((a) => (
                  <button key={a.id} type="button" onClick={() => setForm((f) => ({ ...f, zoneId: a.zoneId, street: a.street, building: a.building, floor: a.floor, saveAddress: false }))}
                    className={cn("rounded-xl px-3 py-2 text-sm font-bold ring-1", form.street === a.street && form.zoneId === a.zoneId ? "bg-brand-50 text-brand-700 ring-brand-300" : "ring-ink-line")}>
                    {a.label}: {a.street.slice(0, 28)}
                  </button>
                ))}
              </div>
            )}
            <label className="label" htmlFor="zone">المنطقة</label>
            <div className="relative">
              <select id="zone" className="input appearance-none pl-10" value={form.zoneId} onChange={(e) => set("zoneId", e.target.value)}>
                <option value="">— اختر الحي —</option>
                {zones.map((z) => <option key={z.id} value={z.id}>{z.name} · توصيل {num(z.fee)} ل.س · ~{z.minutes} د</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-mute" />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
              <div><label className="label" htmlFor="st">الشارع / أقرب معلم</label><input id="st" className="input" placeholder="مثال: جانب جامع الروضة" value={form.street} onChange={(e) => set("street", e.target.value)} /></div>
              <div><label className="label" htmlFor="bd">البناء</label><input id="bd" className="input" value={form.building} onChange={(e) => set("building", e.target.value)} /></div>
              <div><label className="label" htmlFor="fl">الطابق</label><input id="fl" className="input" value={form.floor} onChange={(e) => set("floor", e.target.value)} /></div>
            </div>
            <div className="mt-4"><label className="label" htmlFor="nt">ملاحظات للسائق أو للتجهيز (اختياري)</label>
              <textarea id="nt" rows={2} className="input h-auto py-3" placeholder="مثلاً: الخبز يكون طازة، رنّ الجرس مرتين…" value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
            {user && (
              <label className="mt-3 flex items-center gap-2 text-sm font-bold text-ink-soft">
                <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.saveAddress} onChange={(e) => set("saveAddress", e.target.checked)} /> احفظ العنوان لطلباتي الجاية
              </label>
            )}
          </Step>

          <Step n={3} title="وقت التوصيل" Icon={Clock}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((s) => (
                <button key={s} type="button" onClick={() => set("slot", s)}
                  className={cn("relative rounded-2xl px-3 py-3 text-sm font-bold ring-1 transition", form.slot === s ? "bg-brand-600 text-white ring-brand-600 shadow-pop" : "bg-white ring-ink-line hover:ring-ink/30")}>
                  {s === "بأسرع وقت" && zone ? `بأسرع وقت (~${zone.minutes} د)` : s}
                </button>
              ))}
            </div>
          </Step>

          <Step n={4} title="طريقة الدفع" Icon={Banknote}>
            <div className="grid gap-3 sm:grid-cols-2">
              {([["COD_SYP", "كاش بالليرة السورية", "ادفع للسائق عند الاستلام", Banknote], ["COD_USD", "كاش بالدولار", `حسب سعر الصرف ${num(settings.usdRate)} ل.س`, DollarSign]] as const).map(([k, t, s, Icon]) => (
                <button key={k} type="button" onClick={() => set("payment", k)}
                  className={cn("flex items-center gap-3 rounded-2xl p-4 text-right ring-1 transition", form.payment === k ? "bg-brand-50 ring-2 ring-brand-500" : "ring-ink-line hover:ring-ink/30")}>
                  <span className={cn("grid h-11 w-11 place-items-center rounded-xl", form.payment === k ? "bg-brand-600 text-white" : "bg-paper text-ink-soft")}><Icon className="h-5 w-5" /></span>
                  <span className="flex-1"><span className="block font-black">{t}</span><span className="text-xs text-ink-mute">{s}</span></span>
                  {form.payment === k && <Check className="h-5 w-5 text-brand-600" />}
                </button>
              ))}
            </div>
          </Step>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="card overflow-hidden">
            <div className="border-b border-ink-line p-5">
              <h2 className="text-lg font-black">ملخّص الطلب</h2>
              <p className="text-xs text-ink-mute">{items.length} منتج</p>
            </div>
            <ul className="max-h-64 space-y-3 overflow-y-auto p-5">
              {items.map((i) => (
                <li key={i.key} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-paper">
                    <ProductImage src={i.image} name={i.name} icon={i.categoryIcon} size={100} />
                    <span className="absolute -left-0 -top-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-ink px-1 text-[10px] font-black text-white">{i.qty}</span>
                  </div>
                  <span className="min-w-0 flex-1"><span className="line-clamp-1 text-sm font-bold">{i.name}</span>{i.grams ? <span className="text-[11px] text-ink-mute">{i.unit} · تقديري</span> : null}</span>
                  <span className="text-sm font-black tabular">{m(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t border-ink-line p-5">
              <FreeDeliveryBar subtotal={q?.subtotal ?? 0} />
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
                    <input className="input h-11 pr-9 uppercase" dir="ltr" placeholder="كود الخصم" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
                  </div>
                  {q?.coupon ? (
                    <button type="button" onClick={() => { set("couponCode", ""); setCouponInput(""); }} className="btn-ghost btn-sm h-11">إزالة</button>
                  ) : (
                    <button type="button" onClick={() => set("couponCode", couponInput.trim())} className="btn-dark btn-sm h-11">تطبيق</button>
                  )}
                </div>
                {q?.coupon && <p className="mt-2 text-xs font-bold text-emerald-700">✓ {q.coupon.code}: {q.coupon.label}</p>}
                {form.couponCode && couponProblem && <p className="mt-2 text-xs font-bold text-brand-700">{couponProblem}</p>}
              </div>
              {user && (q?.pointsAvailable ?? user.points) > 0 && (
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-ink p-3.5 text-white">
                  <span className="flex items-center gap-2 text-sm font-bold"><Gift className="h-5 w-5 text-brand-400" /> استخدم نقاطي ({num(q?.pointsAvailable ?? user.points)} نقطة)</span>
                  <input type="checkbox" className="h-5 w-5 accent-brand-600" checked={form.usePoints} onChange={(e) => set("usePoints", e.target.checked)} />
                </label>
              )}
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink-mute">المجموع</dt><dd className="font-bold tabular">{m(q?.subtotal ?? 0)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-mute">التوصيل {q?.zone ? `(${q.zone.name})` : ""}</dt>
                  <dd className="font-bold tabular">{!form.zoneId ? "اختر المنطقة" : q?.deliveryFee === 0 ? <span className="text-emerald-600">مجاني</span> : m(q?.deliveryFee ?? 0)}</dd></div>
                {!!q?.couponDiscount && <div className="flex justify-between text-emerald-700"><dt>خصم الكود</dt><dd className="font-bold tabular">-{m(q.couponDiscount)}</dd></div>}
                {!!q?.pointsDiscount && <div className="flex justify-between text-emerald-700"><dt>خصم النقاط ({q.pointsUsed})</dt><dd className="font-bold tabular">-{m(q.pointsDiscount)}</dd></div>}
                <div className="flex items-center justify-between border-t border-dashed border-ink-line pt-3 text-lg">
                  <dt className="font-black">الإجمالي</dt>
                  <dd className="flex items-center gap-2 font-black tabular">{quoting && <Loader2 className="h-4 w-4 animate-spin text-ink-mute" />}{m(q?.total ?? 0)}</dd>
                </div>
                {!!q?.pointsToEarn && <p className="text-xs font-bold text-brand-700">رح تربح {q.pointsToEarn} نقطة بعد التوصيل</p>}
              </dl>
              {blocking.map((p) => <p key={p} className="flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs font-bold text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" />{p}</p>)}
              {error && <p className="rounded-xl bg-brand-50 p-3 text-sm font-bold text-brand-700" role="alert">{error}</p>}
              {!settings.isOpen && <p className="rounded-xl bg-zinc-100 p-3 text-sm font-bold text-zinc-600">المتجر مغلق حالياً — {settings.openHours}</p>}
              <button onClick={submit} disabled={placing || quoting || !q || blocking.length > 0 || !settings.isOpen} className="btn-primary hidden h-14 w-full text-lg lg:flex">
                {placing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />} تأكيد الطلب {q ? `· ${m(q.total)}` : ""}
              </button>
              {q?.hasWeightItems && <p className="rounded-xl bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-800">الخضار والفواكه بتنوزن عند التجهيز — المبلغ النهائي ممكن يختلف شوي حسب الوزن الفعلي، والسائق بيعطيك الفاتورة الدقيقة.</p>}
              <p className="text-center text-xs text-ink-mute">بالضغط على تأكيد الطلب، بيوصلنا طلبك فوراً ومنتواصل معك إذا لزم</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky confirm bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-line bg-white/95 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <button onClick={submit} disabled={placing || quoting || !q || blocking.length > 0 || !settings.isOpen} className="btn-primary h-14 w-full justify-between px-5 text-base">
          <span className="flex items-center gap-2">{placing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />} تأكيد الطلب</span>
          <span className="flex items-center gap-2 tabular">{quoting && <Loader2 className="h-4 w-4 animate-spin opacity-70" />}{m(q?.total ?? 0)}</span>
        </button>
        {(error || blocking[0]) && <p className="mt-2 text-center text-xs font-bold text-brand-700">{error ?? blocking[0]}</p>}
      </div>
    </div>
  );
}
