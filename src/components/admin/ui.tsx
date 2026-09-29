"use client";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

export function Submit({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className={cn("btn-primary", className)}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}{children}</button>;
}

export function FormMsg({ state }: { state: { error?: string; message?: string } | undefined }) {
  if (!state) return null;
  if (state.error) return <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700" role="alert">{state.error}</p>;
  if (state.message) return <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{state.message}</p>;
  return null;
}

export function Toggle({ name, defaultChecked, label }: { name: string; defaultChecked?: boolean; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-bold">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-6 w-11 rounded-full bg-zinc-300 transition after:absolute after:right-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-brand-600 peer-checked:after:-translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500" />
      {label}
    </label>
  );
}
