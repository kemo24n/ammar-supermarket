import Link from "next/link";
import { and, asc, desc, eq, ilike, lte, or } from "drizzle-orm";
import { Download, Pencil, Plus, Search, Upload } from "lucide-react";
import { db, schema } from "@/db";
import { PageHead } from "@/components/admin/Page";
import { InlineNumber, InlineToggle } from "@/components/admin/ProductRowEdit";
import { ProductImage } from "@/components/shop/ProductImage";
import { cn } from "@/lib/format";

export const metadata = { title: "المنتجات" };

export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; f?: string; saved?: string }> }) {
  const sp = await searchParams;
  const p = schema.products;
  const q = (sp.q ?? "").trim();
  const where = and(
    q ? or(ilike(p.name, `%${q}%`), ilike(p.sku, `%${q}%`), ilike(p.barcode, `%${q}%`), ilike(p.brand, `%${q}%`)) : undefined,
    sp.cat ? eq(p.categoryId, sp.cat) : undefined,
    sp.f === "low" ? or(and(eq(p.soldBy, "unit"), lte(p.stock, 10)), and(eq(p.soldBy, "weight"), lte(p.stock, 3000))) : sp.f === "hidden" ? eq(p.active, false) : sp.f === "featured" ? eq(p.featured, true) : sp.f === "all" ? undefined : eq(p.active, true),
  );
  const [rows, cats] = await Promise.all([
    db.query.products.findMany({ where, orderBy: [asc(p.categoryId), desc(p.featured), asc(p.name)], limit: 500, with: { category: { columns: { name: true, icon: true } } } }),
    db.select().from(schema.categories).orderBy(asc(schema.categories.sort)),
  ]);
  const catOrder = new Map(cats.map((c, i) => [c.id, i]));
  rows.sort((a, b) => (catOrder.get(a.categoryId) ?? 99) - (catOrder.get(b.categoryId) ?? 99) || Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, "ar"));
  const href = (x: Record<string, string | undefined>) => `/admin/products?${new URLSearchParams(Object.entries({ q, cat: sp.cat, f: sp.f, ...x }).filter(([, v]) => v) as [string, string][])}`;

  return (
    <div>
      <PageHead title="المنتجات" sub={`${rows.length} منتج — عدّل السعر والكمية مباشرة من الجدول`} actions={<>
        <a href="/admin/products/export" className="btn-ghost btn-sm h-11"><Download className="h-4 w-4" /> تصدير CSV</a>
        <Link href="/admin/products/import" className="btn-ghost btn-sm h-11"><Upload className="h-4 w-4" /> استيراد من Excel</Link>
        <Link href="/admin/products/new" className="btn-primary btn-sm h-11"><Plus className="h-4 w-4" /> منتج جديد</Link>
      </>} />
      {sp.saved && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">✓ تم حفظ المنتج</p>}
      <div className="mb-4 flex flex-wrap gap-2">
        <form className="relative min-w-[220px] flex-1" action="/admin/products">
          {sp.cat && <input type="hidden" name="cat" value={sp.cat} />}
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input name="q" defaultValue={q} placeholder="اسم، SKU أو باركود" className="input h-11 pr-10" />
        </form>
        <form action="/admin/products" className="flex gap-2">
          {q && <input type="hidden" name="q" value={q} />}
          <select name="cat" defaultValue={sp.cat ?? ""} className="input h-11 w-auto" aria-label="القسم">
            <option value="">كل الأقسام</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn-dark btn-sm h-11">تصفية</button>
        </form>
      </div>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {[["", "الفعّالة"], ["all", "الكل"], ["low", "مخزون منخفض"], ["featured", "مميزة"], ["hidden", "مخفية"]].map(([k, l]) => (
          <Link key={k} href={href({ f: k })} className={cn("shrink-0 rounded-xl px-3.5 py-2 text-sm font-bold ring-1", (sp.f ?? "") === k ? "bg-ink text-white ring-ink" : "bg-white ring-ink-line")}>{l}</Link>
        ))}
      </div>
      {/* Phone: compact cards with inline edit */}
      <div className="space-y-2 md:hidden">
        {rows.map((r) => (
          <div key={r.id} className={cn("card flex items-center gap-3 p-3", !r.active && "opacity-60")}>
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-paper"><ProductImage src={r.image} name="" icon={r.category.icon} size={110} /></div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/products/${r.id}`} className="line-clamp-1 text-sm font-bold">{r.name}</Link>
              <div className="text-[11px] text-ink-mute">{r.soldBy === "weight" ? "بالوزن" : r.unit} · {r.category.name}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <InlineNumber id={r.id} field="price" value={r.price} suffix={r.soldBy === "weight" ? "/كغ" : "ل.س"} />
                <InlineNumber id={r.id} field="stock" value={r.soldBy === "weight" ? r.stock / 1000 : r.stock} suffix={r.soldBy === "weight" ? "كغ" : "قطعة"} low={r.soldBy === "weight" ? 3 : 5} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2"><InlineToggle id={r.id} field="active" value={r.active} /><InlineToggle id={r.id} field="featured" value={r.featured} /></div>
          </div>
        ))}
      </div>
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-paper/70 text-right text-xs text-ink-mute">
            <tr>{["المنتج", "القسم", "السعر (ل.س)", "الكمية", "مميز", "ظاهر", ""].map((h, i) => <th key={i} className="px-4 py-3 font-bold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-ink-line">
            {rows.map((r) => (
              <tr key={r.id} className={cn("hover:bg-paper/50", !r.active && "opacity-60")}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-paper"><ProductImage src={r.image} name="" icon={r.category.icon} size={90} /></div>
                    <div className="min-w-0"><div className="truncate font-bold">{r.name}</div><div className="text-xs text-ink-mute">{r.soldBy === "weight" ? "بالوزن" : r.unit}{r.sku ? ` · ${r.sku}` : ""}</div></div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs font-bold text-ink-soft">{r.category.name}</td>
                <td className="px-4 py-2.5"><InlineNumber id={r.id} field="price" value={r.price} suffix={r.soldBy === "weight" ? "/كغ" : undefined} /></td>
                <td className="px-4 py-2.5"><InlineNumber id={r.id} field="stock" value={r.soldBy === "weight" ? r.stock / 1000 : r.stock} suffix={r.soldBy === "weight" ? "كغ" : undefined} low={r.soldBy === "weight" ? 3 : 5} /></td>
                <td className="px-4 py-2.5"><InlineToggle id={r.id} field="featured" value={r.featured} /></td>
                <td className="px-4 py-2.5"><InlineToggle id={r.id} field="active" value={r.active} /></td>
                <td className="px-4 py-2.5 text-left"><Link href={`/admin/products/${r.id}`} className="inline-grid h-9 w-9 place-items-center rounded-xl hover:bg-paper" aria-label="تعديل"><Pencil className="h-4 w-4" /></Link></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="py-16 text-center text-ink-mute">لا توجد منتجات مطابقة</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
