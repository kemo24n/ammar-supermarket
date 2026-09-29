"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BellRing, X } from "lucide-react";

function chime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    [880, 1175, 1568].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.16;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.start(t); o.stop(t + 0.32);
    });
  } catch { /* audio blocked until user interacts */ }
}

/** Rings + shows a toast whenever the number of pending orders goes up (layout refreshes every 20s). */
export function NewOrderAlert({ pending }: { pending: number }) {
  const prev = useRef<number | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (prev.current !== null && pending > prev.current) { chime(); setShow(true); document.title = `(${pending}) طلب جديد!`; }
    if (pending === 0) document.title = "لوحة الإدارة | عمار للتسوق";
    prev.current = pending;
  }, [pending]);
  if (!show) return null;
  return (
    <div className="fixed bottom-5 left-5 z-50 flex animate-rise items-center gap-3 rounded-2xl bg-ink p-4 pl-3 text-white shadow-2xl">
      <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-brand-600"><span className="absolute inset-0 animate-ring rounded-xl bg-brand-500" /><BellRing className="relative h-5 w-5" /></span>
      <div><div className="font-black">وصل طلب جديد!</div><div className="text-xs text-white/70">{pending} طلب بانتظار التأكيد</div></div>
      <Link href="/admin/orders?status=PENDING" onClick={() => setShow(false)} className="btn-sm btn bg-white text-ink">عرض</Link>
      <button onClick={() => setShow(false)} className="text-white/60 hover:text-white" aria-label="إغلاق"><X className="h-4 w-4" /></button>
    </div>
  );
}
