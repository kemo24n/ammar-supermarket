"use client";
import { usePathname } from "next/navigation";
import { ChevronLeft, ShoppingBasket } from "lucide-react";
import { cartCount, cartTotal, useCart } from "@/store/cart";
import { useMoney, useMounted, useStore } from "./StoreProvider";

/** Floating "view basket" bar for phones — sits above the bottom nav. */
export function CartBar() {
  const items = useCart((s) => s.items);
  const bump = useCart((s) => s.bump);
  const setOpen = useCart((s) => s.setOpen);
  const mounted = useMounted();
  const path = usePathname();
  const m = useMoney();
  const { settings } = useStore();
  if (!mounted || !items.length || path.startsWith("/checkout") || path.startsWith("/cart") || path.startsWith("/order")) return null;
  const total = cartTotal(items);
  const left = settings.freeDeliveryOver - total;
  return (
    <div className="fixed inset-x-3 bottom-[76px] z-40 animate-rise md:hidden no-print">
      <button data-cart-target onClick={() => setOpen(true)} className="relative flex h-14 w-full items-center gap-3 overflow-hidden rounded-2xl bg-brand-600 px-3 text-white shadow-pop active:scale-[.98]">
        <span className="stripes absolute inset-0 opacity-40" />
        <span key={bump} className="relative grid h-9 min-w-9 animate-pop place-items-center rounded-xl bg-white px-2 text-sm font-black text-brand-700">{cartCount(items)}</span>
        <span className="relative flex-1 text-right leading-tight">
          <span className="block text-[15px] font-black">عرض السلة</span>
          <span className="block text-[11px] font-bold text-white/80">{left > 0 ? `أضف ${m(left)} للتوصيل المجاني` : "التوصيل مجاني ✓"}</span>
        </span>
        <span className="relative flex items-center gap-1 font-black tabular">{m(total)}<ChevronLeft className="h-4 w-4" /></span>
        <ShoppingBasket className="absolute -bottom-3 left-24 h-16 w-16 -rotate-12 opacity-10" />
      </button>
    </div>
  );
}
