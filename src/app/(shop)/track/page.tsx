import { PackageSearch } from "lucide-react";
import { TrackForm } from "@/components/shop/TrackForm";

export const metadata = { title: "تتبّع طلبك" };

export default async function Track({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  return (
    <div className="container-x grid place-items-center py-14">
      <div className="card w-full max-w-md p-8">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600"><PackageSearch className="h-8 w-8" /></span>
        <h1 className="mt-4 text-center text-2xl font-black">تتبّع طلبك</h1>
        <p className="mb-6 mt-1 text-center text-sm text-ink-mute">دخّل رقم الطلب ورقم الموبايل اللي طلبت فيه</p>
        <TrackForm code={code ?? ""} />
      </div>
    </div>
  );
}
