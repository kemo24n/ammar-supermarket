"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Boxes, ClipboardList, ExternalLink, Image as ImageIcon, LayoutGrid, LogOut, Map, Menu, Settings, Ticket, Users, UserCog, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/format";

const NAV = [
  { href: "/admin", label: "لوحة التحكم", Icon: BarChart3, admin: false },
  { href: "/admin/orders", label: "الطلبات", Icon: ClipboardList, admin: false, badge: true },
  { href: "/admin/products", label: "المنتجات", Icon: Boxes, admin: false },
  { href: "/admin/categories", label: "الأقسام", Icon: LayoutGrid, admin: false },
  { href: "/admin/banners", label: "البانرات", Icon: ImageIcon, admin: true },
  { href: "/admin/coupons", label: "أكواد الخصم", Icon: Ticket, admin: true },
  { href: "/admin/zones", label: "مناطق التوصيل", Icon: Map, admin: true },
  { href: "/admin/customers", label: "الزبائن", Icon: Users, admin: true },
  { href: "/admin/team", label: "الفريق والسائقين", Icon: UserCog, admin: true },
  { href: "/admin/settings", label: "الإعدادات", Icon: Settings, admin: true },
];

export function AdminNav({ role, name, pending, logout }: { role: string; name: string; pending: number; logout: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => !n.admin || role === "ADMIN");
  const nav = (
    <nav className="flex h-full flex-col">
      <div className="p-5"><Logo href="/admin" /></div>
      <div className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map(({ href, label, Icon, badge }) => {
          const active = href === "/admin" ? path === href : path.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={cn("flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-bold transition", active ? "bg-brand-600 text-white shadow-pop" : "text-ink-soft hover:bg-paper")}>
              <Icon className="h-5 w-5" /> <span className="flex-1">{label}</span>
              {badge && pending > 0 && <span className={cn("grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-black", active ? "bg-white text-brand-700" : "bg-brand-600 text-white")}>{pending}</span>}
            </Link>
          );
        })}
      </div>
      <div className="space-y-1 border-t border-ink-line p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-ink-soft hover:bg-paper"><ExternalLink className="h-4 w-4" /> فتح المتجر</Link>
        <form action={logout}><button className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-ink-soft hover:bg-paper"><LogOut className="h-4 w-4" /> خروج ({name.split(" ")[0]})</button></form>
      </div>
    </nav>
  );
  return (
    <>
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 border-l border-ink-line bg-white lg:block no-print">{nav}</aside>
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-line bg-white px-4 lg:hidden no-print">
        <Logo href="/admin" sub={false} />
        <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-paper" aria-label="القائمة"><Menu className="h-5 w-5" /></button>
      </div>
      {/* Mobile bottom tab bar for staff on phones */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-ink-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden no-print">
        {[{ href: "/admin", label: "الرئيسية", Icon: BarChart3 }, { href: "/admin/orders", label: "الطلبات", Icon: ClipboardList, badge: true }, { href: "/admin/products", label: "المنتجات", Icon: Boxes }].map(({ href, label, Icon, badge }) => {
          const active = href === "/admin" ? path === href : path.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold", active ? "text-brand-600" : "text-ink-mute")}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />{label}
              {badge && pending > 0 && <span className="absolute right-[calc(50%-22px)] top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-black text-white ring-2 ring-white">{pending}</span>}
            </Link>
          );
        })}
        <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold text-ink-mute"><Menu className="h-5 w-5" />المزيد</button>
      </nav>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 bg-white shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute left-3 top-4 grid h-9 w-9 place-items-center rounded-xl bg-paper" aria-label="إغلاق"><X className="h-4 w-4" /></button>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}
