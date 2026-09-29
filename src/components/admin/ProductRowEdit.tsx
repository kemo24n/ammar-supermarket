"use client";
import { useState, useTransition } from "react";
import { Check, Loader2, Star } from "lucide-react";
import { quickUpdateProductAction } from "@/app/admin/actions";
import { cn } from "@/lib/format";

export function InlineNumber({ id, field, value, suffix, low = 5 }: { id: string; field: "price" | "stock"; value: number; suffix?: string; low?: number }) {
  const [v, setV] = useState(String(value));
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const dirty = Number(v) !== value;
  const save = () => {
    const n = Number(v.replace(/,/g, ""));
    if (!Number.isFinite(n) || n < 0 || !dirty) return;
    start(async () => { await quickUpdateProductAction(id, { [field]: n }); setSaved(true); setTimeout(() => setSaved(false), 1500); });
  };
  return (
    <div className="flex items-center gap-1">
      <input value={v} onChange={(e) => setV(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        inputMode="decimal" dir="ltr" aria-label={field === "price" ? "السعر" : "الكمية"}
        className={cn("h-9 w-20 rounded-xl sm:w-24 bg-paper px-2 text-center font-black tabular outline-none ring-1 ring-transparent focus:bg-white focus:ring-brand-500",
          field === "stock" && value <= low && "text-brand-600")} />
      <span className="min-w-4 whitespace-nowrap">{pending ? <Loader2 className="h-4 w-4 animate-spin text-ink-mute" /> : saved ? <Check className="h-4 w-4 text-emerald-600" /> : suffix ? <span className="text-[10px] text-ink-mute">{suffix}</span> : null}</span>
    </div>
  );
}

export function InlineToggle({ id, field, value }: { id: string; field: "active" | "featured"; value: boolean }) {
  const [v, setV] = useState(value);
  const [pending, start] = useTransition();
  const flip = () => start(async () => { setV(!v); await quickUpdateProductAction(id, { [field]: !v }); });
  if (field === "featured") {
    return <button onClick={flip} disabled={pending} aria-label="مميز"><Star className={cn("h-5 w-5 transition", v ? "fill-amber-400 text-amber-400" : "text-zinc-300 hover:text-zinc-400")} /></button>;
  }
  return (
    <button onClick={flip} disabled={pending} aria-label="تفعيل" className={cn("relative h-6 w-11 rounded-full transition", v ? "bg-emerald-500" : "bg-zinc-300")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", v ? "right-[22px]" : "right-0.5")} />
    </button>
  );
}
