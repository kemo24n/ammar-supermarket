"use client";
import { useEffect, useState } from "react";

function left() {
  const now = new Date();
  const end = new Date(now); end.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
}

export function Countdown() {
  const [t, setT] = useState<number[] | null>(null);
  useEffect(() => { setT(left()); const i = setInterval(() => setT(left()), 1000); return () => clearInterval(i); }, []);
  const parts = t ?? [0, 0, 0];
  return (
    <div className="flex items-center gap-1.5 tabular" dir="ltr" aria-label="ينتهي العرض خلال">
      {parts.map((v, k) => (
        <span key={k} className="flex items-center gap-1.5">
          <span className="grid h-10 w-11 place-items-center rounded-xl bg-ink text-lg font-black text-white">{String(v).padStart(2, "0")}</span>
          {k < 2 && <span className="font-black text-ink">:</span>}
        </span>
      ))}
    </div>
  );
}
