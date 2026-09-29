import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import type { PublicSettings } from "./StoreProvider";

export function Footer({ s, categories }: { s: PublicSettings; categories: { slug: string; name: string }[] }) {
  return (
    <footer className="relative mt-12 md:mt-20 overflow-hidden bg-ink text-white">
      <div className="h-2 bg-brand-600 stripes" />
      <div className="container-x grid gap-8 py-10 md:grid-cols-4 md:gap-10 md:py-14">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm leading-7 text-white/70">سوبر ماركت عمار — كل احتياجات العائلة بمكان واحد، وبأسعار محسوبة صح. اطلب من البيت ونحنا منوصّل.</p>
        </div>
        <div className="hidden md:block">
          <h4 className="mb-4 font-black">الأقسام</h4>
          <ul className="grid grid-cols-2 gap-2 text-sm text-white/70">
            {categories.slice(0, 10).map((c) => <li key={c.slug}><Link className="hover:text-white" href={`/category/${c.slug}`}>{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-black">روابط</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link className="hover:text-white" href="/offers">العروض</Link></li>
            <li><Link className="hover:text-white" href="/track">تتبّع طلبك</Link></li>
            <li><Link className="hover:text-white" href="/account">حسابي ونقاطي</Link></li>
            <li><Link className="hover:text-white" href="/staff-login">دخول الموظفين</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-black">تواصل معنا</h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand-400" />{s.address}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-brand-400" /><a dir="ltr" href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a></li>
            <li className="flex gap-2"><MessageCircle className="h-4 w-4 shrink-0 text-brand-400" /><a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer">واتساب</a></li>
            <li className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-brand-400" />{s.openHours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} عمار للتسوق — جميع الحقوق محفوظة</span>
          <a href="https://instagram.com/soluneragency" target="_blank" rel="noreferrer" className="hover:text-white">تصميم وتطوير <b className="text-white/80">Solunera</b> — Kamel Nassif</a>
        </div>
      </div>
    </footer>
  );
}
