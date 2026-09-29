import { searchProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/shop/Section";
import { SortBar, parseSort } from "@/components/shop/SortBar";
import { Empty } from "@/components/shop/Empty";

export const metadata = { title: "بحث" };

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const sort = parseSort(sp.sort);
  const items = q ? await searchProducts(q, sort) : [];
  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-black sm:text-3xl">{q ? <>نتائج البحث عن «<span className="text-brand-600">{q}</span>»</> : "ابحث عن منتج"}</h1>
      <p className="mt-1 text-sm text-ink-mute">{items.length} نتيجة</p>
      {q && <div className="my-5"><SortBar base="/search" current={sort} params={{ q }} /></div>}
      {items.length ? <ProductGrid products={items} /> : q ? <Empty title="ما لقينا شي بهالاسم" sub="جرّب كلمة تانية، أو ابعتلنا طلبك واتساب ومنأمّنلك ياه" /> : null}
    </div>
  );
}
