import { requireRole } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageHead, Panel } from "@/components/admin/Page";
import { ZoneForm } from "@/components/admin/CrudForms";

export const metadata = { title: "مناطق التوصيل" };

export default async function Zones() {
  await requireRole(["ADMIN"], "/admin");
  const rows = await db.select().from(schema.zones).orderBy(asc(schema.zones.sort));
  return (
    <div>
      <PageHead title="مناطق التوصيل" sub="أحياء حلب، أجرة التوصيل والوقت التقريبي لكل حي" />
      <Panel title="حي جديد" className="mb-6"><ZoneForm /></Panel>
      <Panel>
        <div className="mb-2 hidden grid-cols-[2fr_1fr_1fr_70px_auto_auto] gap-2 px-1 text-xs font-bold text-ink-mute sm:grid"><span>الحي</span><span>الأجرة (ل.س)</span><span>الدقائق</span><span>ترتيب</span><span>فعّال</span><span /></div>
        <div className="space-y-2">{rows.map((z) => <ZoneForm key={z.id} z={z} />)}</div>
      </Panel>
    </div>
  );
}
