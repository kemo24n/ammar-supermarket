"use client";
import { useTransition } from "react";
import { toggleCouponAction } from "@/app/admin/actions";
import { cn } from "@/lib/format";

export function CouponToggle({ id, active }: { id: string; active: boolean }) {
  const [p, start] = useTransition();
  return (
    <button disabled={p} onClick={() => start(() => toggleCouponAction(id, !active))} className={cn("rounded-lg px-2.5 py-1 text-xs font-bold", active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500")}>
      {active ? "فعّال" : "متوقف"}
    </button>
  );
}
