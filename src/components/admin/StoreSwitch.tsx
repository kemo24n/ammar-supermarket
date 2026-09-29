"use client";
import { useOptimistic, useTransition } from "react";
import { Store } from "lucide-react";
import { toggleStoreOpenAction } from "@/app/admin/actions";
import { cn } from "@/lib/format";

export function StoreSwitch({ isOpen }: { isOpen: boolean }) {
  const [open, setOpen] = useOptimistic(isOpen);
  const [, start] = useTransition();
  return (
    <button onClick={() => start(async () => { setOpen(!open); await toggleStoreOpenAction(!open); })}
      className={cn("btn h-11 px-4 text-sm", open ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-zinc-800 text-white")}>
      <Store className="h-4 w-4" /> {open ? "المتجر مفتوح للطلبات" : "المتجر مغلق"}
      <span className={cn("h-2.5 w-2.5 rounded-full", open ? "animate-pulse bg-white" : "bg-zinc-500")} />
    </button>
  );
}
