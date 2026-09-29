"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ImagePlus } from "lucide-react";
import { saveProductAction, type FormState } from "@/app/admin/actions";
import { FormMsg, Submit, Toggle } from "./ui";
import { ProductImage } from "@/components/shop/ProductImage";
import type { Product } from "@/db/schema";

export function ProductForm({ p, cats }: { p?: Product; cats: { id: string; name: string; icon: string }[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveProductAction, undefined);
  const [preview, setPreview] = useState<string | null>(p?.image ?? null);
  const [catId, setCatId] = useState(p?.categoryId ?? "");
  const [soldBy, setSoldBy] = useState(p?.soldBy ?? "unit");
  const isW = soldBy === "weight";
  const icon = cats.find((c) => c.id === catId)?.icon;
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="card space-y-4 p-6">
        <div><label className="label" htmlFor="name">اسم المنتج *</label><input id="name" name="name" defaultValue={p?.name} required className="input" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="categoryId">القسم *</label>
            <select id="categoryId" name="categoryId" required value={catId} onChange={(e) => setCatId(e.target.value)} className="input"><option value="">— اختر —</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label" htmlFor="brand">الماركة / المصدر</label><input id="brand" name="brand" defaultValue={p?.brand ?? ""} className="input" /></div>
        </div>
        <div>
          <span className="label">طريقة البيع</span>
          <input type="hidden" name="soldBy" value={soldBy} />
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-paper p-1.5">
            {([["unit", "بالقطعة / العبوة"], ["weight", "بالوزن (½ كغ و 1 كغ)"]] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setSoldBy(k)} className={`h-11 rounded-xl text-sm font-black transition ${soldBy === k ? "bg-white text-brand-700 shadow ring-1 ring-brand-200" : "text-ink-mute"}`}>{l}</button>
            ))}
          </div>
          {isW && <p className="mt-2 text-xs font-bold text-amber-700">السعر للكيلو، والزبون بيختار ½ كغ أو 1 كغ ويشوف سعر تقديري.</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="label" htmlFor="price">{isW ? "سعر الكيلو (ل.س) *" : "السعر (ل.س جديدة) *"}</label><input id="price" name="price" defaultValue={p?.price} required inputMode="numeric" dir="ltr" className="input text-left" /></div>
          <div><label className="label" htmlFor="comparePrice">السعر قبل الخصم</label><input id="comparePrice" name="comparePrice" defaultValue={p?.comparePrice ?? ""} inputMode="numeric" dir="ltr" className="input text-left" placeholder="اتركه فارغاً إذا ما في عرض" /></div>
          <div><label className="label" htmlFor="unit">الوحدة</label><input id="unit" name="unit" defaultValue={p?.unit ?? "قطعة"} disabled={isW} className="input disabled:opacity-50" placeholder="1 كغ، علبة، ربطة…" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="label" htmlFor="stock">{isW ? "المخزون (كغ)" : "الكمية بالمخزون"}</label><input id="stock" name="stock" key={soldBy} defaultValue={p ? (p.soldBy === "weight" ? p.stock / 1000 : p.stock) : 50} inputMode="decimal" dir="ltr" className="input text-left" /></div>
          <div><label className="label" htmlFor="sku">الرمز SKU</label><input id="sku" name="sku" defaultValue={p?.sku ?? ""} dir="ltr" className="input text-left" /></div>
          <div><label className="label" htmlFor="barcode">الباركود</label><input id="barcode" name="barcode" defaultValue={p?.barcode ?? ""} dir="ltr" className="input text-left" /></div>
        </div>
        <div><label className="label" htmlFor="description">الوصف</label><textarea id="description" name="description" defaultValue={p?.description ?? ""} rows={4} className="input h-auto py-3" /></div>
        <FormMsg state={state} />
        <div className="flex gap-2"><Submit>حفظ المنتج</Submit><Link href="/admin/products" className="btn-ghost">إلغاء</Link></div>
      </div>
      <div className="space-y-4">
        <div className="card p-5">
          <div className="label">صورة المنتج</div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-paper"><ProductImage src={preview} name={p?.name ?? "صورة المنتج"} icon={icon} size={600} /></div>
          <label className="btn-ghost btn-sm mt-3 w-full cursor-pointer"><ImagePlus className="h-4 w-4" /> رفع صورة
            <input type="file" name="imageFile" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} />
          </label>
          <input name="image" defaultValue={p?.image ?? ""} dir="ltr" placeholder="أو رابط صورة https://…" className="input mt-2 h-10 text-left text-xs" onChange={(e) => setPreview(e.target.value || null)} />
        </div>
        <div className="card space-y-4 p-5">
          <Toggle name="active" defaultChecked={p?.active ?? true} label="ظاهر بالمتجر" />
          <Toggle name="featured" defaultChecked={p?.featured ?? false} label="منتج مميز" />
        </div>
      </div>
    </form>
  );
}
