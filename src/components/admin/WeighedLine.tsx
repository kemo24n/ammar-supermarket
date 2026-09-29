"use client";
import { useState, useTransition } from "react";
import { Check, Loader2, Scale } from "lucide-react";
import { updateWeighedLineAction } from "@/app/admin/actions";

export function WeighedLine({ orderId, itemId, value, editable }: { orderId: string; itemId: string; value: number; editable: boolean }) {
  const [v, setV] = useState(String(value));
  const [p, start] = useTransition();
  const [ok, setOk] = useState(false);
  if (!editable) return null;
  return (
    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-amber-800 no-print">
      <Scale className="h-3.5 w-3.5" /> بعد الوزن:
      <input value={v} onChange={(e) => setV(e.target.value)} inputMode="numeric" dir="ltr" className="h-7 w-20 rounded-lg bg-amber-50 px-2 text-center font-black outline-none ring-1 ring-amber-200 focus:ring-amber-500" aria-label="المبلغ بعد الوزن" />
      <button disabled={p || Number(v) === value} onClick={() => start(async () => { await updateWeighedLineAction(orderId, itemId, Number(v)); setOk(true); setTimeout(() => setOk(false), 1500); })}
        className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500 text-white disabled:opacity-40" aria-label="حفظ">
        {p ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      </button>
      {ok && <span className="text-emerald-700">تم ✓</span>}
    </div>
  );
}
