import { requireRole } from "@/lib/auth";
import { inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageHead, Panel } from "@/components/admin/Page";
import { TeamForm } from "@/components/admin/CrudForms";

export const metadata = { title: "الفريق والسائقين" };

const ROLE = { ADMIN: "مدير", STAFF: "موظف", DRIVER: "سائق", CUSTOMER: "زبون" } as const;

export default async function Team() {
  await requireRole(["ADMIN"], "/admin");
  const u = schema.users;
  const rows = await db.select({
    id: u.id, name: u.name, phone: u.phone, role: u.role, vehicle: u.vehicle, active: u.active,
    delivered: sql<number>`(select count(*)::int from orders where orders.driver_id = "users"."id" and orders.status = 'DELIVERED')`,
    open: sql<number>`(select count(*)::int from orders where orders.driver_id = "users"."id" and orders.status = 'OUT_FOR_DELIVERY')`,
  }).from(u).where(inArray(u.role, ["ADMIN", "STAFF", "DRIVER"])).orderBy(u.role);
  return (
    <div>
      <PageHead title="الفريق والسائقين" sub="حسابات دخول للموظفين والسائقين — كل سائق بيشوف طلباته من موبايله" />
      <Panel title="عضو جديد" className="mb-6"><TeamForm /></Panel>
      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((r) => (
          <Panel key={r.id} title={`${r.name} · ${ROLE[r.role]}`} actions={r.role === "DRIVER" ? <span className="text-xs font-bold text-ink-mute">{r.delivered} توصيلة · {r.open} بالطريق</span> : null}>
            <TeamForm u={r} />
          </Panel>
        ))}
      </div>
    </div>
  );
}
