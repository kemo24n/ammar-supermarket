"use client";
import { useActionState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { changePasswordAction } from "@/app/actions/account";

export function ChangePassword() {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  return (
    <details className="card p-5">
      <summary className="flex cursor-pointer items-center gap-2 font-black"><KeyRound className="h-5 w-5 text-brand-600" /> تغيير كلمة المرور</summary>
      <form action={action} className="mt-4 space-y-3">
        <input name="current" type="password" required placeholder="كلمة المرور الحالية" className="input h-11" autoComplete="current-password" aria-label="كلمة المرور الحالية" />
        <input name="next" type="password" required minLength={6} placeholder="كلمة المرور الجديدة" className="input h-11" autoComplete="new-password" aria-label="كلمة المرور الجديدة" />
        {state?.error && <p className="text-sm font-bold text-brand-700">{state.error}</p>}
        {state?.message && <p className="text-sm font-bold text-emerald-700">{state.message}</p>}
        <button disabled={pending} className="btn-dark btn-sm h-10 w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />}حفظ</button>
      </form>
    </details>
  );
}
