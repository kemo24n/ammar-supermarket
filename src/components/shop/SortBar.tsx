import Link from "next/link";
import { cn } from "@/lib/format";
import type { SortKey } from "@/lib/catalog";

const SORTS: { k: SortKey; l: string }[] = [
  { k: "popular", l: "الأكثر طلباً" }, { k: "discount", l: "أعلى خصم" }, { k: "price-asc", l: "الأرخص" }, { k: "price-desc", l: "الأغلى" }, { k: "new", l: "الأحدث" },
];

export function SortBar({ base, current, params = {} }: { base: string; current: SortKey; params?: Record<string, string | undefined> }) {
  const href = (k: SortKey) => {
    const sp = new URLSearchParams(Object.entries({ ...params, sort: k }).filter(([, v]) => v) as [string, string][]);
    return `${base}?${sp.toString()}`;
  };
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {SORTS.map((s) => (
        <Link key={s.k} href={href(s.k)} scroll={false}
          className={cn("shrink-0 rounded-xl px-3.5 py-2 text-sm font-bold ring-1 transition", current === s.k ? "bg-ink text-white ring-ink" : "bg-white text-ink-soft ring-ink-line hover:ring-ink/30")}>
          {s.l}
        </Link>
      ))}
    </div>
  );
}

export function parseSort(v?: string): SortKey {
  return (["popular", "price-asc", "price-desc", "discount", "new"] as const).includes(v as SortKey) ? (v as SortKey) : "popular";
}
