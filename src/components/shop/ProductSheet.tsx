"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { useUi } from "@/store/cart";
import { ProductImage } from "./ProductImage";
import { BuyBox } from "./AddToCart";
import { FavButton } from "./FavButton";
import { Price } from "./Price";
import { useMoney } from "./StoreProvider";
import { cn, discountPct } from "@/lib/format";

/** Mobile quick-view bottom sheet (swipe down to close). */
export function ProductSheet() {
  const p = useUi((s) => s.sheet);
  const close = useUi((s) => s.closeSheet);
  const m = useMoney();
  const imgRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!p) { setShown(false); return; }
    const t = requestAnimationFrame(() => setShown(true));
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(t); document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [p, close]);

  if (!p) return null;
  const pct = discountPct(p.price, p.comparePrice);
  const isWeight = p.soldBy === "weight";
  const dismiss = () => { setShown(false); setTimeout(close, 220); };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={p.name}>
      <div onClick={dismiss} className={cn("absolute inset-0 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300", shown ? "opacity-100" : "opacity-0")} />
      <div
        className="absolute inset-x-0 bottom-0 mx-auto max-h-[92vh] max-w-lg overflow-y-auto rounded-t-[2rem] bg-white pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)]"
        style={{ transform: shown ? `translateY(${drag}px)` : "translateY(100%)" }}
        onTouchStart={(e) => { if ((e.currentTarget.scrollTop ?? 0) <= 0) start.current = e.touches[0].clientY; }}
        onTouchMove={(e) => { if (start.current != null) setDrag(Math.max(0, e.touches[0].clientY - start.current)); }}
        onTouchEnd={() => { if (drag > 110) dismiss(); setDrag(0); start.current = null; }}
      >
        <div className="sticky top-0 z-10 flex justify-center bg-white/80 pb-1 pt-3 backdrop-blur"><span className="h-1.5 w-12 rounded-full bg-zinc-300" /></div>
        <div className="px-5">
          <div ref={imgRef} className="relative mx-auto aspect-[4/3] overflow-hidden rounded-3xl bg-paper">
            <ProductImage src={p.image} name={p.name} icon={p.category?.icon} size={800} />
            {pct > 0 && <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-black text-white">وفّر {pct}%</span>}
            <FavButton id={p.id} size="lg" className="absolute left-3 top-3" />
            <button onClick={dismiss} className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow" aria-label="إغلاق"><X className="h-5 w-5" /></button>
          </div>
          {p.brand && <div className="mt-4 text-xs font-black text-brand-600">{p.brand}</div>}
          <h2 className="mt-1 text-2xl font-black leading-tight">{p.name}</h2>
          <div className="mt-2">
            {isWeight
              ? <div className="flex items-baseline gap-1.5"><span className="text-2xl font-black tabular">{m(p.price)}</span><span className="font-bold text-ink-mute">للكيلو</span></div>
              : <div className="flex items-center gap-2"><Price value={p.price} compare={p.comparePrice} big /><span className="text-sm text-ink-mute">· {p.unit}</span></div>}
          </div>
          {p.description && <p className="mt-3 line-clamp-3 text-sm leading-7 text-ink-soft">{p.description}</p>}
          {isWeight && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-800">الخضار والفواكه بتنوزن عند التجهيز، والسعر النهائي بيكون حسب الوزن الفعلي (فرق بسيط زيادة أو نقصان).</p>}
          <div className="mt-5"><BuyBox variant="page" flyFrom={imgRef} p={{ id: p.id, slug: p.slug, name: p.name, unit: p.unit, price: p.price, image: p.image, stock: p.stock, soldBy: p.soldBy, weightOptions: p.weightOptions, categoryIcon: p.category?.icon }} /></div>
          <Link href={`/product/${p.slug}`} onClick={() => close()} className="mt-4 flex items-center justify-center gap-1 py-2 text-sm font-bold text-ink-mute">كل التفاصيل <ChevronLeft className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}
