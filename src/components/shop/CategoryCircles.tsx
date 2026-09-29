import Link from "next/link";
import { BadgePercent } from "lucide-react";
import { CatIcon } from "@/components/ui/Icon";

type C = { id: string; slug: string; name: string; icon: string; image: string | null; tint: string };

/** Story-style category row (mobile-first). */
export function CategoryCircles({ cats }: { cats: C[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-1 stagger">
      <Link href="/offers" className="flex w-[72px] shrink-0 flex-col items-center gap-1.5 text-center">
        <span className="relative grid h-[68px] w-[68px] place-items-center rounded-full bg-brand-600 text-white ring-[3px] ring-brand-200 ring-offset-2">
          <span className="stripes absolute inset-0 rounded-full opacity-50" /><BadgePercent className="relative h-7 w-7" />
        </span>
        <span className="text-[11.5px] font-black leading-tight text-brand-700">العروض</span>
      </Link>
      {cats.map((c) => (
        <Link key={c.id} href={`/category/${c.slug}`} className="group flex w-[72px] shrink-0 flex-col items-center gap-1.5 text-center">
          <span className="grid h-[68px] w-[68px] place-items-center overflow-hidden rounded-full ring-1 ring-black/5 transition group-active:scale-95" style={{ background: c.tint }}>
            {c.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={c.image.includes("unsplash") ? `${c.image}?w=160&h=160&fit=crop&auto=format&q=70` : c.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              : <CatIcon name={c.icon} className="h-7 w-7 text-brand-600" strokeWidth={1.8} />}
          </span>
          <span className="line-clamp-2 text-[11.5px] font-bold leading-tight text-ink-soft">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}
