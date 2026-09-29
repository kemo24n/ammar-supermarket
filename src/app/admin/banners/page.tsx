import { requireRole } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { db, schema } from "@/db";
import { deleteBannerAction } from "@/app/admin/actions";
import { PageHead, Panel } from "@/components/admin/Page";
import { BannerForm } from "@/components/admin/CrudForms";

export const metadata = { title: "البانرات" };

export default async function Banners() {
  await requireRole(["ADMIN"], "/admin");
  const rows = await db.select().from(schema.banners).orderBy(asc(schema.banners.sort));
  return (
    <div>
      <PageHead title="بانرات الصفحة الرئيسية" sub="السلايدر الكبير أعلى المتجر — للعروض والمواسم" />
      <Panel title="بانر جديد" className="mb-6"><BannerForm /></Panel>
      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((b) => (
          <Panel key={b.id} title={b.title} actions={<form action={deleteBannerAction.bind(null, b.id)}><button className="text-ink-mute hover:text-brand-600" aria-label="حذف"><Trash2 className="h-4 w-4" /></button></form>}>
            {b.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.image.includes("unsplash") ? `${b.image}?w=700&h=220&fit=crop&auto=format` : b.image} alt="" className="mb-4 h-28 w-full rounded-2xl object-cover" />
            )}
            <BannerForm b={b} />
          </Panel>
        ))}
      </div>
    </div>
  );
}
