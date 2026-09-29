"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, MapPin, Search, ShoppingBasket, User } from "lucide-react";
import { Logo, Mark } from "@/components/ui/Logo";
import { CatIcon } from "@/components/ui/Icon";
import { cartCount, useCart, useUi } from "@/store/cart";
import { useCurrency, useMounted, useStore } from "./StoreProvider";
import { cn } from "@/lib/format";

export function CurrencyToggle({ className }: { className?: string }) {
  const [c, setC] = useCurrency();
  return (
    <div className={cn("relative grid h-10 grid-cols-2 items-center rounded-xl bg-paper p-1 text-xs font-black ring-1 ring-ink-line", className)} role="group" aria-label="العملة">
      <span className={cn("absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-ink shadow transition-all duration-300", c === "SYP" ? "right-1" : "right-[calc(50%+3px)]")} />
      {(["SYP", "USD"] as const).map((k) => (
        <button key={k} onClick={() => setC(k)} className={cn("relative z-10 h-full rounded-lg px-2.5 transition-colors", c === k ? "text-white" : "text-ink-mute hover:text-ink")}>
          {k === "SYP" ? "ل.س" : "$"}
        </button>
      ))}
    </div>
  );
}

function SearchTrigger({ className }: { className?: string }) {
  const setSearch = useUi((s) => s.setSearch);
  return (
    <button onClick={() => setSearch(true)} className={cn("relative flex h-12 w-full items-center rounded-2xl bg-paper pr-12 text-right text-[15px] text-ink-mute ring-1 ring-transparent transition hover:ring-ink-line", className)} aria-label="بحث">
      <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
      ابحث عن رز، زيت، لبنة، منظفات…
    </button>
  );
}

export function Header({ categories }: { categories: { slug: string; name: string; icon: string }[] }) {
  const { settings, user } = useStore();
  const items = useCart((s) => s.items);
  const bump = useCart((s) => s.bump);
  const setOpen = useCart((s) => s.setOpen);
  const mounted = useMounted();
  const count = mounted ? cartCount(items) : 0;
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const accountHref = user ? (user.role === "CUSTOMER" ? "/account" : user.role === "DRIVER" ? "/driver" : "/admin") : "/login";

  return (
    <>
      {settings.announcement && (
        <div className="relative overflow-hidden bg-brand-600 text-white">
          <div className="stripes absolute inset-0 animate-stripes opacity-60" />
          <div className="container-x relative flex h-8 items-center justify-center gap-3 text-[12px] font-bold sm:h-9 sm:text-[13px]">
            <span className="truncate">{settings.announcement}</span>
            {!settings.isOpen && <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] text-brand-700">مغلق حالياً</span>}
          </div>
        </div>
      )}
      <header className={cn("sticky top-0 z-40 border-b bg-white/90 backdrop-blur-xl transition-shadow", scrolled ? "border-ink-line shadow-[0_8px_30px_-18px_rgba(0,0,0,.25)]" : "border-transparent")}>
        {/* Mobile header */}
        <div className="container-x flex h-16 items-center gap-2 md:hidden">
          <Link href="/" className="flex items-center gap-2" aria-label="عمار للتسوق"><Mark className="h-10 w-10" /></Link>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1 text-[11px] font-bold text-ink-mute"><MapPin className="h-3 w-3 text-brand-600" /> التوصيل إلى</div>
            <div className="truncate text-[15px] font-black">حلب · كل الأحياء</div>
          </div>
          <CurrencyToggle />
          <Link href={accountHref} className="grid h-10 w-10 place-items-center rounded-xl bg-paper" aria-label="حسابي"><User className="h-5 w-5" /></Link>
        </div>
        <div className="container-x pb-2.5 md:hidden"><SearchTrigger /></div>

        {/* Desktop header */}
        <div className="container-x hidden h-[72px] items-center gap-6 md:flex">
          <Logo />
          <div className="hidden items-center gap-2 rounded-2xl bg-paper px-3 py-2 text-xs lg:flex">
            <MapPin className="h-4 w-4 text-brand-600" />
            <div className="leading-tight"><div className="font-bold text-ink-mute">التوصيل إلى</div><div className="font-black">حلب · كل الأحياء</div></div>
          </div>
          <SearchTrigger className="flex-1" />
          <div className="flex items-center gap-2">
            <CurrencyToggle />
            <Link href={accountHref} className="flex h-12 items-center gap-2 rounded-2xl px-3 font-bold text-ink hover:bg-paper">
              <User className="h-5 w-5" /><span className="max-w-[8rem] truncate text-sm">{user ? user.name.split(" ")[0] : "دخول"}</span>
            </Link>
            <button data-cart-target onClick={() => setOpen(true)} className="relative flex h-12 items-center gap-2 rounded-2xl bg-brand-600 px-4 font-bold text-white shadow-pop transition hover:bg-brand-700" aria-label="السلة">
              <ShoppingBasket className="h-5 w-5" /><span className="text-sm">السلة</span>
              {count > 0 && <span key={bump} className="absolute -left-1.5 -top-1.5 grid h-6 min-w-6 animate-pop place-items-center rounded-full bg-ink px-1.5 text-xs font-black ring-2 ring-white">{count}</span>}
            </button>
          </div>
        </div>

        <nav className={cn("container-x no-scrollbar -mb-px flex gap-1 overflow-x-auto pb-2", path === "/" && "hidden md:flex")}>
          <Link href="/offers" className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-black transition", path === "/offers" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100")}>
            <Clock className="h-4 w-4" /> عروض اليوم
          </Link>
          {categories.map((c) => {
            const active = path === `/category/${c.slug}`;
            return (
              <Link key={c.slug} href={`/category/${c.slug}`} scroll={false} className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition", active ? "bg-ink text-white" : "text-ink-soft hover:bg-paper")}>
                <CatIcon name={c.icon} className="h-4 w-4" /> {c.name}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
