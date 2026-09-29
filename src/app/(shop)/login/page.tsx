import { Suspense } from "react";
import { AuthForm } from "@/components/shop/AuthForm";
import { Mark } from "@/components/ui/Logo";

export const metadata = { title: "تسجيل الدخول" };

export default function Login() {
  return (
    <div className="container-x grid place-items-center py-12">
      <div className="card w-full max-w-md p-8">
        <Mark className="mx-auto h-16 w-16" />
        <h1 className="mt-4 text-center text-2xl font-black">أهلا فيك من جديد</h1>
        <p className="mb-6 mt-1 text-center text-sm text-ink-mute">سجّل دخول لتتابع طلباتك وتجمع نقاط عمار</p>
        <Suspense><AuthForm mode="login" /></Suspense>
      </div>
    </div>
  );
}
