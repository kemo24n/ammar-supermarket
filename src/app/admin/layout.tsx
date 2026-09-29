import { count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireRole } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { NewOrderAlert } from "@/components/admin/NewOrderAlert";
import { AutoRefresh } from "@/components/shop/AutoRefresh";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "لوحة الإدارة", template: "%s | إدارة عمار" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await requireRole(["ADMIN", "STAFF"], "/staff-login");
  const [{ n }] = await db.select({ n: count() }).from(schema.orders).where(eq(schema.orders.status, "PENDING"));
  return (
    <div className="min-h-screen bg-paper">
      <AdminNav role={u.role} name={u.name} pending={n} logout={logoutAction} />
      <NewOrderAlert pending={n} />
      <AutoRefresh every={20000} />
      <div className="lg:pr-64"><div className="mx-auto max-w-[1400px] p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8">{children}</div></div>
    </div>
  );
}
