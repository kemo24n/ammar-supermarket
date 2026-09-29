import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { Banknote, ChevronLeft, Clock, PackageCheck, ShieldCheck } from "lucide-react";
import { db, schema } from "@/db";
import { listByCategory } from "@/lib/catalog";
import { ProductImage } from "@/components/shop/ProductImage";
import { Price } from "@/components/shop/Price";
import { BuyBox } from "@/components/shop/AddToCart";
import { FavButton } from "@/components/shop/FavButton";
import { Money } from "@/components/shop/Price";
import { ProductRail, SectionHead } from "@/components/shop/Section";
import { discountPct } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  return db.query.products.findFirst({ where: and(eq(schema.products.slug, decodeURIComponent(slug)), eq(schema.products.active, true)), with: { category: true } });
}

export async function generateMetadata({ params }: Props) {
  const p = await load((await params).slug);
  return p ? { title: p.name, description: p.description ?? undefined } : { title: "منتج" };
}

export default async function ProductPage({ params }: Props) {
  const p = await load((await params).slug);
  if (!p) notFound();
  const related = (await listByCategory(p.categoryId, 13)).filter((x) => x.id !== p.id).slice(0, 12);
  const pct = discountPct(p.price, p.comparePrice);

  return (
    <div className="container-x py-6">
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-sm font-bold text-ink-mute">
        <Link href="/" className="hover:text-ink">الرئيسية</Link><ChevronLeft className="h-3.5 w-3.5" />
        <Link href={`/category/${p.category.slug}`} className="hover:text-ink">{p.category.name}</Link><ChevronLeft className="h-3.5 w-3.5" />
        <span className="text-ink">{p.name}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white ring-1 ring-ink-line">
          <ProductImage src={p.image} name={p.name} icon={p.category.icon} size={900} />
          {pct > 0 && <span className="absolute right-4 top-4 rounded-2xl bg-brand-600 px-3 py-1.5 text-lg font-black text-white shadow-pop">وفّر {pct}%</span>}
          <FavButton id={p.id} size="lg" className="absolute left-4 top-4" />
        </div>
        <div className="flex flex-col">
          {p.brand && <span className="text-sm font-black text-brand-600">{p.brand}</span>}
          <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">{p.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="chip bg-paper text-ink-soft ring-ink-line">{p.soldBy === "weight" ? "بالوزن · ½ كغ أو 1 كغ" : p.unit}</span>
            {p.soldBy === "weight" ? (p.stock > 0 ? <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">طازج ومتوفر</span> : <span className="chip bg-zinc-100 text-zinc-500 ring-zinc-200">نفدت الكمية</span>) : null}
            {p.soldBy !== "weight" && p.stock > 10 && <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">متوفر</span>}
            {p.soldBy !== "weight" && p.stock > 0 && p.stock <= 10 && <span className="chip bg-amber-50 text-amber-700 ring-amber-200">كمية محدودة — باقي {p.stock}</span>}
            {p.soldBy !== "weight" && p.stock <= 0 && <span className="chip bg-zinc-100 text-zinc-500 ring-zinc-200">نفدت الكمية</span>}
            {p.sku && <span className="text-xs text-ink-mute" dir="ltr">SKU {p.sku}</span>}
          </div>
          <div className="mt-6">
            {p.soldBy === "weight"
              ? <div className="flex items-baseline gap-2"><Money value={p.price} className="text-3xl font-black" /><span className="font-bold text-ink-mute">للكيلو</span>{p.comparePrice && p.comparePrice > p.price && <Money value={p.comparePrice} className="text-ink-mute line-through" />}</div>
              : <Price value={p.price} compare={p.comparePrice} big />}
          </div>
          {p.description && <p className="mt-5 leading-8 text-ink-soft">{p.description}</p>}
          <div className="mt-8 max-w-md">
            <BuyBox variant="page" p={{ id: p.id, slug: p.slug, name: p.name, unit: p.unit, price: p.price, image: p.image, stock: p.stock, soldBy: p.soldBy, weightOptions: p.weightOptions, categoryIcon: p.category.icon }} />
            {p.soldBy === "weight" && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-800">بتنوزن عند التجهيز، والسعر النهائي حسب الوزن الفعلي.</p>}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              { Icon: Clock, t: "توصيل خلال 20–50 دقيقة", s: "حسب منطقتك بحلب" },
              { Icon: Banknote, t: "الدفع عند الاستلام", s: "بالليرة السورية أو بالدولار" },
              { Icon: ShieldCheck, t: "ضمان الجودة", s: "إذا ما عجبك منبدّلو فوراً" },
              { Icon: PackageCheck, t: "تغليف نظيف", s: "كل طلب بيتجهّز بعناية" },
            ].map(({ Icon, t, s }) => (
              <div key={t} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-ink-line">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></span>
                <div><div className="text-sm font-black">{t}</div><div className="text-xs text-ink-mute">{s}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-14">
          <SectionHead title="منتجات مشابهة" href={`/category/${p.category.slug}`} />
          <ProductRail products={related.slice(0, 6)} />
        </section>
      )}
    </div>
  );
}
