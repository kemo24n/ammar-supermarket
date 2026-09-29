import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageHead } from "@/components/admin/Page";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "تعديل منتج" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, cats] = await Promise.all([
    db.query.products.findFirst({ where: eq(schema.products.id, id) }),
    db.select({ id: schema.categories.id, name: schema.categories.name, icon: schema.categories.icon }).from(schema.categories).orderBy(asc(schema.categories.sort)),
  ]);
  if (!p) notFound();
  return <div><PageHead title={p.name} sub={`تم البيع ${p.soldCount} مرة`} /><ProductForm p={p} cats={cats} /></div>;
}
