"use client";
import { useRef, useState } from "react";
import { Minus, Plus, ShoppingBasket } from "lucide-react";
import { useCart } from "@/store/cart";
import { useMoney, useMounted } from "./StoreProvider";
import { WeightPicker } from "./WeightPicker";
import { flyToCart, haptic } from "@/lib/fx";
import { gramsLabel, lineKey, unitsInStock, weightOptions, weightPrice } from "@/lib/weight";
import { cn } from "@/lib/format";

export type BuyProduct = {
  id: string; slug: string; name: string; unit: string; price: number; image: string | null; stock: number;
  soldBy?: string; weightOptions?: string; categoryIcon?: string;
};

/**
 * Add-to-cart control. For weight products it shows ½ كغ / 1 كغ chips and an estimated price.
 * `flyFrom` = element to animate into the cart (usually the product image wrapper).
 */
export function BuyBox({ p, variant = "card", flyFrom }: { p: BuyProduct; variant?: "card" | "page"; flyFrom?: React.RefObject<HTMLElement | null> }) {
  const mounted = useMounted();
  const m = useMoney();
  const isWeight = p.soldBy === "weight";
  const opts = isWeight ? weightOptions(p.weightOptions) : [];
  const [grams, setGrams] = useState<number>(opts.includes(1000) ? 1000 : opts[0] ?? 0);
  const key = lineKey(p.id, isWeight ? grams : null);
  const item = useCart((s) => s.items.find((i) => i.key === key));
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const btnRef = useRef<HTMLButtonElement>(null);
  const qty = mounted ? item?.qty ?? 0 : 0;
  const maxUnits = isWeight ? unitsInStock(p.stock, grams) : p.stock;
  const unitPrice = isWeight ? weightPrice(p.price, grams) : p.price;
  const out = maxUnits <= 0;
  const big = variant === "page";

  const doAdd = () => {
    add({ id: p.id, slug: p.slug, name: p.name, unit: isWeight ? gramsLabel(grams) : p.unit, price: unitPrice, grams: isWeight ? grams : null, image: p.image, stock: maxUnits, categoryIcon: p.categoryIcon });
    haptic(); flyToCart(flyFrom?.current ?? btnRef.current);
  };

  return (
    <div className="space-y-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      {isWeight && (
        <>
          <WeightPicker options={opts} value={grams} onChange={setGrams} size={big ? "lg" : "sm"} />
          <div className={cn("flex items-center justify-between font-bold text-ink-mute", big ? "text-sm" : "text-[11px]")}>
            <span>{gramsLabel(grams)} ≈ <b className="text-ink tabular">{m(unitPrice)}</b></span>
            <span className="rounded-md bg-amber-50 px-1.5 text-amber-700">تقديري</span>
          </div>
        </>
      )}
      {out ? (
        <button disabled className={cn("w-full rounded-2xl bg-zinc-100 font-bold text-zinc-400", big ? "h-14" : "h-10 text-sm")}>نفدت الكمية</button>
      ) : qty === 0 ? (
        <button ref={btnRef} onClick={doAdd}
          className={cn("flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 font-bold text-white transition hover:bg-brand-700 active:scale-[.96]", big ? "h-14 text-lg shadow-pop" : "h-10 text-sm")}>
          <ShoppingBasket className={big ? "h-5 w-5" : "h-4 w-4"} /> أضف للسلة
        </button>
      ) : (
        <div className={cn("flex w-full animate-[rise_.25s_ease] items-center justify-between rounded-2xl bg-ink p-1 text-white", big ? "h-14" : "h-10")}>
          <button aria-label="زيادة" onClick={() => { setQty(key, qty + 1); haptic(8); }} disabled={qty >= maxUnits}
            className="grid aspect-square h-full place-items-center rounded-xl bg-white/10 transition hover:bg-brand-600 active:scale-90 disabled:opacity-40"><Plus className="h-4 w-4" /></button>
          <span className="text-center font-black tabular leading-tight">
            {qty}{isWeight && <span className="block text-[10px] font-bold text-white/60">{gramsLabel(grams)}</span>}
            {!isWeight && big && <span className="mr-1 text-xs font-bold text-white/60">{p.unit}</span>}
          </span>
          <button aria-label="إنقاص" onClick={() => { setQty(key, qty - 1); haptic(8); }}
            className="grid aspect-square h-full place-items-center rounded-xl bg-white/10 transition hover:bg-brand-600 active:scale-90"><Minus className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}
