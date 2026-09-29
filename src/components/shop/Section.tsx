import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductCard, type CardProduct } from "./ProductCard";

export function SectionHead({ title, sub, href, extra }: { title: string; sub?: string; href?: string; extra?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-black sm:text-[28px]"><span className="h-7 w-1.5 rounded-full bg-brand-600" />{title}</h2>
        {sub && <p className="mt-1 text-sm text-ink-mute">{sub}</p>}
      </div>
      <div className="flex items-center gap-4">
        {extra}
        {href && <Link href={href} className="flex items-center gap-1 text-sm font-black text-brand-600 hover:gap-2 transition-all">عرض الكل <ArrowLeft className="h-4 w-4" /></Link>}
      </div>
    </div>
  );
}

export function ProductRail({ products }: { products: CardProduct[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0 lg:[&>*:nth-child(n+7)]:hidden">
      {products.map((p) => <div key={p.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-[23%] lg:w-auto"><ProductCard p={p} /></div>)}
    </div>
  );
}

export function ProductGrid({ products }: { products: CardProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 stagger">
      {products.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
