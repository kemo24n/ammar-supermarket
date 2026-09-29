import Link from "next/link";
import { Mark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center p-6 text-center">
      <div>
        <Mark className="mx-auto h-20 w-20" />
        <h1 className="mt-6 text-5xl font-black text-brand-600">404</h1>
        <p className="mt-2 text-lg font-bold">الصفحة اللي عم تدور عليها مو موجودة</p>
        <Link href="/" className="btn-primary mt-6">رجوع للمتجر</Link>
      </div>
    </div>
  );
}
