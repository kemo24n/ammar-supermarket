"use client";
import { useMoney } from "./StoreProvider";
import { cn } from "@/lib/format";

export function Price({ value, compare, className, big }: { value: number; compare?: number | null; className?: string; big?: boolean }) {
  const m = useMoney();
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 tabular", className)}>
      <span className={cn("font-black text-ink", big ? "text-2xl" : "text-[15px]")}>{m(value)}</span>
      {compare && compare > value ? <span className={cn("text-ink-mute line-through", big ? "text-base" : "text-xs")}>{m(compare)}</span> : null}
    </span>
  );
}

export function Money({ value, className }: { value: number; className?: string }) {
  const m = useMoney();
  return <span className={cn("tabular", className)}>{m(value)}</span>;
}
