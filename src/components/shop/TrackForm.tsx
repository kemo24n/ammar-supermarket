"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { trackAction } from "@/app/actions/track";

export function TrackForm({ code }: { code: string }) {
  const [state, action, pending] = useActionState(trackAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <div><label className="label" htmlFor="code">رقم الطلب</label><input id="code" name="code" defaultValue={code} required dir="ltr" className="input text-left uppercase" placeholder="AM-24051" /></div>
      <div><label className="label" htmlFor="phone">رقم الموبايل</label><input id="phone" name="phone" required dir="ltr" inputMode="tel" className="input text-left" placeholder="09xx xxx xxx" /></div>
      {state?.error && <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />}تتبّع الطلب</button>
    </form>
  );
}
