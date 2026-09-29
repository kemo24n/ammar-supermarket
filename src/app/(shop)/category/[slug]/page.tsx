import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { db, schema } from "@/db";
import { listCategoryProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/shop/Section";
import { SortBar, parseSort } from "@/components/shop/SortBar";
import { Empty } from "@/components/shop/Empty";
import { CatIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/format";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string; avail?: string; offers?: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const c = await db.query.categories.findFirst({ where: eq(schema.categories.slug, decodeURIComponent(slug)) });
  return { title: c?.name ?? "قسم" };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const c = await db.query.categories.findFirst({ where: eq(schema.categories.slug, decodeURIComponent(slug)) });
  if (!c || !c.active) notFound();
  const sort = parseSort(sp.sort);
  const items = await listCategoryProducts(c.id, sort, sp.avail === "1", sp.offers === "1");
  const toggle = (k: "avail" | "offers") => {
    const q = new URLSearchParams(Object.entries({ ...sp, [k]: sp[k] === "1" ? "" : "1" }).filter(([, v]) => v) as [string, string][]);
    return `/category/${c.slug}?${q}`;
  };

  return (
    <div>
      <div className="relative overflow-hidden" style={{ background: c.tint }}>
        <div className="stripes-red absolute inset-0" />
        <div className="container-x relative flex items-center gap-5 py-8">
          <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl bg-white text-brand-600 shadow-card">
            {c.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={`${c.image}?w=200&h=200&fit=crop&auto=format&q=70`} alt="" className="h-full w-full object-cover" />
              : <CatIcon name={c.icon} className="h-10 w-10" />}
          </span>
          <div>
            <nav className="flex items-center gap-1 text-xs font-bold text-ink-mute"><Link href="/" className="hover:text-ink">الرئيسية</Link><ChevronLeft className="h-3 w-3" /><Link href="/categories" className="hover:text-ink">الأقسام</Link></nav>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">{c.name}</h1>
            <p className="mt-1 text-sm font-bold text-ink-mute">{items.length} منتج</p>
          </div>
        </div>
      </div>
      <div className="container-x py-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SortBar base={`/category/${c.slug}`} current={sort} params={{ avail: sp.avail, offers: sp.offers }} />
          <div className="flex gap-2">
            <Link href={toggle("avail")} scroll={false} className={cn("rounded-xl px-3.5 py-2 text-sm font-bold ring-1", sp.avail === "1" ? "bg-brand-600 text-white ring-brand-600" : "bg-white ring-ink-line")}>المتوفر فقط</Link>
            <Link href={toggle("offers")} scroll={false} className={cn("rounded-xl px-3.5 py-2 text-sm font-bold ring-1", sp.offers === "1" ? "bg-brand-600 text-white ring-brand-600" : "bg-white ring-ink-line")}>عليه عرض</Link>
          </div>
        </div>
        {items.length ? <ProductGrid products={items} /> : <Empty title="ما في منتجات هون حالياً" sub="جرّب تشيل الفلاتر أو تصفّح قسم تاني" href="/categories" cta="كل الأقسام" />}
      </div>
    </div>
  );
}
