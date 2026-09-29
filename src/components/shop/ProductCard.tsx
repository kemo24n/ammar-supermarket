"use client";
import Link from "next/link";
import { useRef } from "react";
import { ProductImage } from "./ProductImage";
import { Price } from "./Price";
import { BuyBox } from "./AddToCart";
import { FavButton } from "./FavButton";
import { useMoney } from "./StoreProvider";
import { useUi } from "@/store/cart";
import { discountPct } from "@/lib/format";

export type CardProduct = {
  id: string; slug: string; name: string; brand: string | null; unit: string; price: number; comparePrice: number | null;
  stock: number; image: string | null; soldBy: string; weightOptions: string; description?: string | null; category?: { icon: string } | null;
};

export function ProductCard({ p }: { p: CardProduct }) {
  const pct = discountPct(p.price, p.comparePrice);
  const imgRef = useRef<HTMLDivElement>(null);
  const openSheet = useUi((s) => s.openSheet);
  const m = useMoney();
  const isWeight = p.soldBy === "weight";
  const lowStock = isWeight ? p.stock > 0 && p.stock < 3000 : p.stock > 0 && p.stock <= 5;
  return (
    <Link
      href={`/product/${p.slug}`}
      onClick={(e) => { if (window.innerWidth < 768) { e.preventDefault(); openSheet(p); } }}
      className="group card flex h-full flex-col overflow-hidden p-2 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:p-2.5"
    >
      <div ref={imgRef} className="relative aspect-square overflow-hidden rounded-2xl bg-paper">
        <ProductImage src={p.image} name={p.name} icon={p.category?.icon} className="transition duration-500 group-hover:scale-105" />
        {pct > 0 && <span className="absolute right-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-black text-white shadow">-{pct}%</span>}
        {lowStock && <span className="absolute bottom-2 right-2 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">كمية محدودة</span>}
        <FavButton id={p.id} className="absolute left-2 top-2" />
      </div>
      <div className="flex flex-1 flex-col px-1 pt-2.5">
        {p.brand && <span className="truncate text-[11px] font-bold text-brand-600">{p.brand}</span>}
        <h3 className="line-clamp-2 min-h-[2.5em] text-[13.5px] font-bold leading-snug text-ink">{p.name}</h3>
        {isWeight ? (
          <div className="mb-2 mt-1 flex items-baseline gap-1 tabular">
            <span className="text-[15px] font-black">{m(p.price)}</span><span className="text-[11px] font-bold text-ink-mute">/ كغ</span>
            {p.comparePrice && p.comparePrice > p.price && <span className="text-[11px] text-ink-mute line-through">{m(p.comparePrice)}</span>}
          </div>
        ) : (
          <>
            <span className="text-[11px] text-ink-mute">{p.unit}</span>
            <div className="mb-2 mt-1"><Price value={p.price} compare={p.comparePrice} /></div>
          </>
        )}
        <div className="mt-auto">
          <BuyBox flyFrom={imgRef} p={{ id: p.id, slug: p.slug, name: p.name, unit: p.unit, price: p.price, image: p.image, stock: p.stock, soldBy: p.soldBy, weightOptions: p.weightOptions, categoryIcon: p.category?.icon }} />
        </div>
      </div>
    </Link>
  );
}
