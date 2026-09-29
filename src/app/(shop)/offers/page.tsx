import { listOffers } from "@/lib/catalog";
import { ProductGrid } from "@/components/shop/Section";
import { Countdown } from "@/components/shop/Countdown";
import { Empty } from "@/components/shop/Empty";

export const metadata = { title: "عروض اليوم" };

export default async function Offers() {
  const items = await listOffers(120);
  return (
    <div>
      <div className="relative overflow-hidden bg-brand-600 text-white">
        <div className="stripes absolute inset-0 opacity-50" />
        <div className="container-x relative flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black ring-1 ring-white/25">عروض محدودة</span>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">عروض اليوم</h1>
            <p className="mt-2 text-white/85">{items.length} منتج بأسعار مخفّضة — احسبها صح!</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-ink"><div className="mb-1.5 text-xs font-bold text-ink-mute">ينتهي العرض خلال</div><Countdown /></div>
        </div>
      </div>
      <div className="container-x py-8">{items.length ? <ProductGrid products={items} /> : <Empty title="ما في عروض حالياً" sub="تابعنا، العروض بتتجدد كل يوم" />}</div>
    </div>
  );
}
