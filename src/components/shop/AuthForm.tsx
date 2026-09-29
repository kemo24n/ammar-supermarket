"use client";
import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { loginAction, registerAction, type AuthState } from "@/app/actions/auth";

export function AuthForm({ mode, staff = false }: { mode: "login" | "register"; staff?: boolean }) {
  const next = useSearchParams().get("next") ?? "";
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? loginAction : registerAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {mode === "register" && (
        <div><label className="label" htmlFor="name">الاسم</label><input id="name" name="name" required className="input" placeholder="مثال: محمد الحلبي" autoComplete="name" /></div>
      )}
      <div><label className="label" htmlFor="phone">رقم الموبايل</label><input id="phone" name="phone" required inputMode="tel" dir="ltr" className="input text-left" placeholder="09xx xxx xxx" autoComplete="tel" /></div>
      <div><div className="flex items-center justify-between"><label className="label" htmlFor="password">كلمة المرور</label>{mode === "login" && !staff && <Link href="/forgot" className="mb-1.5 text-xs font-bold text-brand-600">نسيت كلمة المرور؟</Link>}</div><input id="password" name="password" type="password" required minLength={mode === "register" ? 6 : 1} className="input" autoComplete={mode === "login" ? "current-password" : "new-password"} /></div>
      {state?.error && <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700" role="alert">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "login" ? "دخول" : "إنشاء الحساب"}</button>
      {!staff && (
        <p className="text-center text-sm text-ink-mute">
          {mode === "login" ? <>ما عندك حساب؟ <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-black text-brand-600">سجّل الآن واربح 20 نقطة</Link></>
            : <>عندك حساب؟ <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-black text-brand-600">سجّل دخول</Link></>}
        </p>
      )}
    </form>
  );
}
