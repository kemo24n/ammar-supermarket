"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, Clock, Loader2, Search, TrendingUp, X } from "lucide-react";
import { usePrefs, useUi } from "@/store/cart";
import { instantSearchAction } from "@/app/actions/search";
import type { CardProduct } from "./ProductCard";
import { ProductImage } from "./ProductImage";
import { useMoney } from "./StoreProvider";
import { Illus } from "@/components/ui/Illustrations";

const POPULAR = ["رز", "زيت", "سكر", "لبنة", "بيض", "بندورة", "خبز", "شاي", "جبنة", "منظفات"];

export function SearchOverlay() {
  const open = useUi((s) => s.search);
  const setOpen = useUi((s) => s.setSearch);
  const openSheet = useUi((s) => s.openSheet);
  const { recent, pushRecent } = usePrefs();
  const [q, setQ] = useState("");
  const [res, setRes] = useState<CardProduct[] | null>(null);
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const m = useMoney();

  useEffect(() => {
    if (!open) return;
    setTimeout(() => input.current?.focus(), 50);
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open, setOpen]);

  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return; }
    const t = setTimeout(() => start(async () => setRes((await instantSearchAction(q)) as CardProduct[])), 220);
    return () => clearTimeout(t);
  }, [q]);

  if (!open) return null;
  const go = (term: string) => { if (!term.trim()) return; pushRecent(term.trim()); setOpen(false); router.push(`/search?q=${encodeURIComponent(term.trim())}`); };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-white animate-[rise_.2s_ease] md:bg-ink/40 md:p-10 md:backdrop-blur-sm" role="dialog" aria-label="بحث">
      <div className="flex h-full flex-col bg-white md:mx-auto md:h-auto md:max-h-[80vh] md:w-full md:max-w-2xl md:overflow-hidden md:rounded-3xl md:shadow-2xl">
        <form onSubmit={(e) => { e.preventDefault(); go(q); }} className="flex items-center gap-2 border-b border-ink-line p-3">
          <button type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-xl hover:bg-paper" aria-label="رجوع"><ArrowRight className="h-5 w-5" /></button>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-mute" />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} enterKeyHint="search" placeholder="شو بدك تطلب اليوم؟"
              className="h-12 w-full rounded-2xl bg-paper pr-11 pl-10 text-base outline-none focus:ring-2 focus:ring-brand-500" />
            {pending ? <Loader2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-mute" />
              : q && <button type="button" onClick={() => setQ("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" aria-label="مسح"><X className="h-4 w-4" /></button>}
          </div>
        </form>
        <div className="flex-1 overflow-y-auto p-4">
          {res === null ? (
            <div className="space-y-6">
              {recent.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-ink-mute"><Clock className="h-4 w-4" /> عمليات بحث سابقة</h3>
                  <div className="flex flex-wrap gap-2">{recent.map((r) => <button key={r} onClick={() => go(r)} className="rounded-full bg-paper px-3.5 py-2 text-sm font-bold">{r}</button>)}</div>
                </div>
              )}
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-ink-mute"><TrendingUp className="h-4 w-4" /> الأكثر بحثاً بحلب</h3>
                <div className="flex flex-wrap gap-2">{POPULAR.map((r) => <button key={r} onClick={() => setQ(r)} className="rounded-full bg-brand-50 px-3.5 py-2 text-sm font-bold text-brand-700">{r}</button>)}</div>
              </div>
            </div>
          ) : res.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Illus.NoResults className="h-40 w-40" />
              <p className="mt-3 font-black">ما لقينا «{q}»</p>
              <p className="text-sm text-ink-mute">جرّب كلمة تانية أو ابعتلنا ياها واتساب ومنأمّنها</p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-line">
              {res.map((p) => (
                <li key={p.id}>
                  <button onClick={() => { setOpen(false); openSheet(p); }} className="flex w-full items-center gap-3 py-2.5 text-right">
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-paper"><ProductImage src={p.image} name="" icon={p.category?.icon} size={120} /></span>
                    <span className="min-w-0 flex-1"><span className="line-clamp-1 font-bold">{p.name}</span><span className="text-xs text-ink-mute">{p.soldBy === "weight" ? "بالوزن" : p.unit}</span></span>
                    <span className="font-black tabular">{m(p.price)}{p.soldBy === "weight" && <span className="text-[10px] text-ink-mute">/كغ</span>}</span>
                  </button>
                </li>
              ))}
              <li><button onClick={() => go(q)} className="w-full py-4 text-center text-sm font-black text-brand-600">عرض كل النتائج لـ «{q}»</button></li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
