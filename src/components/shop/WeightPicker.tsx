"use client";
import { gramsLabel } from "@/lib/weight";
import { cn } from "@/lib/format";

export function WeightPicker({ options, value, onChange, size = "sm" }: { options: number[]; value: number; onChange: (g: number) => void; size?: "sm" | "lg" }) {
  return (
    <div className={cn("grid gap-1 rounded-xl bg-paper p-1", size === "lg" && "rounded-2xl p-1.5")} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }} role="radiogroup" aria-label="الوزن">
      {options.map((g) => (
        <button key={g} type="button" role="radio" aria-checked={value === g}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(g); }}
          className={cn("rounded-lg font-black transition-all", size === "lg" ? "h-11 text-base" : "h-7 text-[12px]",
            value === g ? "bg-white text-brand-700 shadow-sm ring-1 ring-brand-200" : "text-ink-mute hover:text-ink")}>
          {gramsLabel(g)}
        </button>
      ))}
    </div>
  );
}
