"use client";
import { useState, useTransition } from "react";
import { ArrowLeft, Bike, Loader2, Printer, X } from "lucide-react";
import { assignDriverAction, updateOrderStatusAction } from "@/app/admin/actions";
import type { OrderStatus } from "@/db/schema";
import { STATUS, STATUS_FLOW } from "@/lib/status";

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: "تأكيد الطلب", CONFIRMED: "بدء التجهيز", PREPARING: "تسليم للسائق", OUT_FOR_DELIVERY: "تم التوصيل",
};

export function OrderActions({ id, status, driverId, drivers }: { id: string; status: OrderStatus; driverId: string | null; drivers: { id: string; name: string }[] }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const idx = STATUS_FLOW.indexOf(status);
  const next = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  const closed = status === "DELIVERED" || status === "CANCELLED";
  const run = (fn: () => Promise<void>) => start(async () => { setErr(null); try { await fn(); } catch (e) { setErr((e as Error).message); } });

  return (
    <div className="space-y-3 no-print">
      {next && !closed && (
        <button disabled={pending || (next === "OUT_FOR_DELIVERY" && !driverId)} onClick={() => run(() => updateOrderStatusAction(id, next))} className="btn-primary h-14 w-full text-base">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}{NEXT_LABEL[status]} <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      {next === "OUT_FOR_DELIVERY" && !driverId && <p className="text-center text-xs font-bold text-amber-700">اختر سائقاً أولاً لتسليم الطلب</p>}
      {!closed && (
        <label className="block">
          <span className="label flex items-center gap-1"><Bike className="h-4 w-4" /> السائق</span>
          <select className="input" defaultValue={driverId ?? ""} disabled={pending} onChange={(e) => run(() => assignDriverAction(id, e.target.value || null))}>
            <option value="">— بدون —</option>
            {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => window.print()} className="btn-ghost btn-sm h-11"><Printer className="h-4 w-4" /> طباعة الفاتورة</button>
        {!closed && (
          <button disabled={pending} onClick={() => { if (confirm("متأكد من إلغاء الطلب؟ رح ترجع الكميات للمخزون.")) run(() => updateOrderStatusAction(id, "CANCELLED")); }}
            className="btn-sm btn h-11 bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"><X className="h-4 w-4" /> إلغاء الطلب</button>
        )}
      </div>
      {!closed && (
        <details className="rounded-2xl bg-paper p-3 text-sm">
          <summary className="cursor-pointer font-bold text-ink-soft">تغيير الحالة يدوياً</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUS_FLOW.filter((s) => s !== status).map((s) => (
              <button key={s} disabled={pending} onClick={() => run(() => updateOrderStatusAction(id, s))} className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold ring-1 ring-ink-line hover:ring-ink/30">{STATUS[s].label}</button>
            ))}
          </div>
        </details>
      )}
      {err && <p className="rounded-xl bg-brand-50 p-2.5 text-sm font-bold text-brand-700">{err}</p>}
    </div>
  );
}
