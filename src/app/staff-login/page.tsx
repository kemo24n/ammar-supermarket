import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";
import { AuthForm } from "@/components/shop/AuthForm";

export const metadata = { title: "دخول الموظفين" };

export default function StaffLogin() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink p-4">
      <div className="stripes fixed inset-0 opacity-[.04]" />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-center text-xl font-black">لوحة الإدارة والسائقين</h1>
        <p className="mb-6 mt-1 text-center text-sm text-ink-mute">دخول مخصّص لفريق عمار للتسوق</p>
        <Suspense><AuthForm mode="login" staff /></Suspense>
      </div>
    </div>
  );
}
