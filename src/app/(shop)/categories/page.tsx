import Link from "next/link";
import { listCategories } from "@/lib/catalog";
import { CatIcon } from "@/components/ui/Icon";

export const metadata = { title: "الأقسام" };

export default async function Categories() {
  const cats = await listCategories();
  return (
    <div className="container-x py-8">
      <h1 className="text-3xl font-black">كل الأقسام</h1>
      <p className="mt-1 text-ink-mute">اختار القسم وابدأ عبّي سلتك</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cats.map((c) => (
          <Link key={c.id} href={`/category/${c.slug}`} className="group flex items-center gap-4 overflow-hidden rounded-3xl p-4 ring-1 ring-black/[.04] transition hover:-translate-y-0.5 hover:shadow-card" style={{ background: c.tint }}>
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-brand-600 shadow-card">
              {c.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={`${c.image}?w=160&h=160&fit=crop&auto=format&q=70`} alt="" className="h-full w-full object-cover transition group-hover:scale-110" />
                : <CatIcon name={c.icon} className="h-8 w-8" />}
            </span>
            <span><span className="block font-black leading-tight">{c.name}</span><span className="text-xs font-bold text-ink-mute">{c.count} منتج</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
