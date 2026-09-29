"use client";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Illus } from "@/components/ui/Illustrations";
import { cartTotal, useCart } from "@/store/cart";
import { ProductImage } from "@/components/shop/ProductImage";
import { Money } from "@/components/shop/Price";
import { FreeDeliveryBar } from "@/components/shop/CartDrawer";
import { useMounted, useStore } from "@/components/shop/StoreProvider";

export default function CartPage() {
  const { items, setQty, remove, clear } = useCart();
  const mounted = useMounted();
  const { settings } = useStore();
  const subtotal = cartTotal(items);
  if (!mounted) return null;
  if (!items.length) return (
    <div className="container-x py-20 text-center">
      <Illus.EmptyBasket className="mx-auto h-48 w-48" />
      <h1 className="mt-5 text-2xl font-black">السلة فاضية</h1>
      <Link href="/" className="btn-primary mt-6">ابدأ التسوق</Link>
    </div>
  );
  return (
    <div className="container-x py-8">
      <div className="flex items-end justify-between"><h1 className="text-3xl font-black">سلتك</h1><button onClick={clear} className="text-sm font-bold text-ink-mute hover:text-brand-600">إفراغ السلة</button></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <ul className="card divide-y divide-ink-line">
          {items.map((i) => (
            <li key={i.key} className="flex items-center gap-4 p-4">
              <Link href={`/product/${i.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-paper"><ProductImage src={i.image} name={i.name} icon={i.categoryIcon} size={160} /></Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${i.slug}`} className="line-clamp-1 font-bold hover:text-brand-600">{i.name}</Link>
                <div className="text-xs text-ink-mute">{i.unit} · <Money value={i.price} />{i.grams ? " (تقديري)" : ""}</div>
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-paper p-1">
                <button onClick={() => setQty(i.key, i.qty + 1)} disabled={i.qty >= i.stock} className="grid h-8 w-8 place-items-center rounded-lg bg-white shadow-sm disabled:opacity-40" aria-label="زيادة"><Plus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-black tabular">{i.qty}</span>
                <button onClick={() => setQty(i.key, i.qty - 1)} className="grid h-8 w-8 place-items-center rounded-lg bg-white shadow-sm" aria-label="إنقاص"><Minus className="h-4 w-4" /></button>
              </div>
              <Money value={i.price * i.qty} className="hidden w-24 text-left font-black sm:block" />
              <button onClick={() => remove(i.key)} className="text-ink-mute hover:text-brand-600" aria-label="حذف"><Trash2 className="h-5 w-5" /></button>
            </li>
          ))}
        </ul>
        <aside className="card h-fit space-y-4 p-5">
          <FreeDeliveryBar subtotal={subtotal} />
          <div className="flex justify-between text-lg"><span className="font-bold">المجموع</span><Money value={subtotal} className="font-black" /></div>
          {subtotal < settings.minOrder && <p className="text-sm font-bold text-brand-700">الحد الأدنى للطلب <Money value={settings.minOrder} /></p>}
          <Link href="/checkout" className={`btn-primary w-full ${subtotal < settings.minOrder ? "pointer-events-none opacity-50" : ""}`}>متابعة لإتمام الطلب</Link>
        </aside>
      </div>
    </div>
  );
}
