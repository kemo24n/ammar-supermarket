import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { PageHead } from "@/components/admin/Page";
import { SettingsForm } from "@/components/admin/CrudForms";

export const metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  await requireRole(["ADMIN"], "/admin");
  const s = await getSettings();
  return <div><PageHead title="الإعدادات" sub="معلومات المتجر، سعر الصرف، التوصيل ونقاط الولاء" /><SettingsForm s={s} /></div>;
}
