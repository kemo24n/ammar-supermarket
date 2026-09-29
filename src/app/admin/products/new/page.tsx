import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageHead } from "@/components/admin/Page";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "منتج جديد" };

export default async function NewProduct() {
  const cats = await db.select({ id: schema.categories.id, name: schema.categories.name, icon: schema.categories.icon }).from(schema.categories).orderBy(asc(schema.categories.sort));
  return <div><PageHead title="منتج جديد" /><ProductForm cats={cats} /></div>;
}
