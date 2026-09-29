import { Download } from "lucide-react";
import { PageHead, Panel } from "@/components/admin/Page";
import { ImportForm } from "@/components/admin/ImportForm";

export const metadata = { title: "استيراد المنتجات" };

export default function ImportPage() {
  return (
    <div>
      <PageHead title="استيراد المنتجات من Excel" sub="أضف مئات المنتجات أو حدّث الأسعار اليومية بملف واحد" />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Panel><ImportForm /></Panel>
        <Panel title="كيف بيشتغل؟">
          <ol className="list-inside list-decimal space-y-2 text-sm leading-7 text-ink-soft">
            <li>نزّل القالب وافتحه بـ Excel.</li>
            <li>عبّي المنتجات: الاسم، القسم، السعر إلزامية.</li>
            <li>إذا كان <b>SKU</b> موجود مسبقاً ← بيتحدّث المنتج (مثالي لتحديث الأسعار كل يوم).</li>
            <li>القسم غير الموجود بينعمل تلقائياً.</li>
            <li>الأسعار بالليرة الجديدة.</li>
          </ol>
          <a href="/admin/products/template" className="btn-dark btn-sm mt-5 w-full"><Download className="h-4 w-4" /> تنزيل القالب</a>
          <a href="/admin/products/export" className="btn-ghost btn-sm mt-2 w-full"><Download className="h-4 w-4" /> تصدير المنتجات الحالية</a>
        </Panel>
      </div>
    </div>
  );
}
