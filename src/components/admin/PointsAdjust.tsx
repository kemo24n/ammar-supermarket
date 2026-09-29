"use client";
import { useState, useTransition } from "react";
import { adjustPointsAction } from "@/app/admin/actions";

export function PointsAdjust({ userId }: { userId: string }) {
  const [v, setV] = useState("");
  const [p, start] = useTransition();
  return (
    <form className="flex items-center gap-1" onSubmit={(e) => { e.preventDefault(); const n = Number(v); if (n) start(async () => { await adjustPointsAction(userId, n); setV(""); }); }}>
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="±" dir="ltr" className="h-8 w-16 rounded-lg bg-paper px-2 text-center text-xs outline-none focus:ring-2 focus:ring-brand-500" aria-label="تعديل النقاط" />
      <button disabled={p} className="rounded-lg bg-ink px-2 py-1.5 text-[11px] font-bold text-white">تعديل</button>
    </form>
  );
}
