"use client";
import { useState, useTransition } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { reorderAction } from "@/app/actions/reorder";
import { useCart } from "@/store/cart";
import { haptic } from "@/lib/fx";
import { cn } from "@/lib/format";

export function ReorderButton({ code, token, className, compact }: { code: string; token?: string; className?: string; compact?: boolean }) {
  const [p, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const items = useCart((s) => s.items);
  const replaceAll = useCart((s) => s.replaceAll);
  const setOpen = useCart((s) => s.setOpen);
  return (
    <div className={className}>
      <button disabled={p} onClick={(e) => {
        e.preventDefault(); e.stopPropagation();
        start(async () => {
          const r = await reorderAction(code, token);
          const merged = [...items];
          for (const it of r.items) { const ex = merged.findIndex((m) => m.key === it.key); if (ex >= 0) merged[ex] = { ...merged[ex], qty: Math.min(merged[ex].qty + it.qty, it.stock) }; else merged.push(it); }
          replaceAll(merged); haptic(20); setOpen(true);
          setMsg(r.missing ? `${r.missing} منتج غير متوفر حالياً` : null);
        });
      }} className={cn(compact ? "btn-sm btn bg-brand-50 text-brand-700 hover:bg-brand-100" : "btn-dark w-full")}>
        {p ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} اطلبه مرة تانية
      </button>
      {msg && <p className="mt-1 text-center text-[11px] font-bold text-amber-700">{msg}</p>}
    </div>
  );
}
