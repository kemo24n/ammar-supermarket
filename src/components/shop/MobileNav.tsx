"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgePercent, Home, LayoutGrid, ShoppingBasket, User } from "lucide-react";
import { cartCount, useCart } from "@/store/cart";
import { useMounted } from "./StoreProvider";
import { cn } from "@/lib/format";

export function MobileNav() {
  const path = usePathname();
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const mounted = useMounted();
  const count = mounted ? cartCount(items) : 0;
  if (path.startsWith("/checkout")) return null;
  const tabs = [
    { href: "/", label: "الرئيسية", Icon: Home },
    { href: "/categories", label: "الأقسام", Icon: LayoutGrid },
    { href: "/offers", label: "العروض", Icon: BadgePercent },
    { href: "/account", label: "حسابي", Icon: User },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden no-print">
      <div className="grid grid-cols-5">
        {tabs.slice(0, 2).map((t) => <Tab key={t.href} {...t} active={path === t.href} />)}
        <button data-cart-target onClick={() => setOpen(true)} className="relative -mt-6 flex flex-col items-center" aria-label="السلة">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-pop ring-4 ring-white"><ShoppingBasket className="h-6 w-6" /></span>
          {count > 0 && <span className="absolute right-1/2 top-0 grid h-5 min-w-5 translate-x-[26px] animate-pop place-items-center rounded-full bg-ink px-1 text-[10px] font-black text-white ring-2 ring-white">{count}</span>}
          <span className="mt-1 text-[11px] font-bold text-ink">السلة</span>
        </button>
        {tabs.slice(2).map((t) => <Tab key={t.href} {...t} active={path.startsWith(t.href)} />)}
      </div>
    </nav>
  );
}

function Tab({ href, label, Icon, active }: { href: string; label: string; Icon: typeof Home; active: boolean }) {
  return (
    <Link href={href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold", active ? "text-brand-600" : "text-ink-mute")}>
      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} /> {label}
    </Link>
  );
}
