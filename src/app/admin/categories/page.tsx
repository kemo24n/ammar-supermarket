import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { listCategories } from "@/lib/catalog";
import { PageHead, Panel } from "@/components/admin/Page";
import { CategoryForm, CategoryPreview } from "@/components/admin/CrudForms";

export const metadata = { title: "الأقسام" };

export default async function Categories() {
  const [cats, counts] = await Promise.all([db.select().from(schema.categories).orderBy(asc(schema.categories.sort)), listCategories()]);
  return (
    <div>
      <PageHead title="الأقسام" sub="رتّب الأقسام، غيّر الأيقونات والألوان والصور" />
      <Panel title="قسم جديد" className="mb-6"><CategoryForm /></Panel>
      <div className="grid gap-4 xl:grid-cols-2">
        {cats.map((c) => (
          <Panel key={c.id} title={c.name} actions={<div className="flex items-center gap-2 text-xs font-bold text-ink-mute">{counts.find((x) => x.id === c.id)?.count ?? 0} منتج فعّال <CategoryPreview icon={c.icon} tint={c.tint} /></div>}>
            <CategoryForm c={c} />
          </Panel>
        ))}
      </div>
    </div>
  );
}
