"use client";
import { useTransition } from "react";
import { Bike, CheckCircle2, Loader2 } from "lucide-react";
import { updateOrderStatusAction } from "@/app/admin/actions";
import type { OrderStatus } from "@/db/schema";

export function DriverActions({ id, status, total }: { id: string; status: OrderStatus; total: string }) {
  const [p, start] = useTransition();
  if (status === "DELIVERED" || status === "CANCELLED") return null;
  if (status !== "OUT_FOR_DELIVERY") {
    return <button disabled={p} onClick={() => start(() => updateOrderStatusAction(id, "OUT_FOR_DELIVERY"))} className="btn-dark h-16 w-full text-lg">{p ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bike className="h-6 w-6" />} استلمت الطلب — انطلقت</button>;
  }
  return (
    <button disabled={p} onClick={() => { if (confirm(`تأكيد التوصيل واستلام ${total}؟`)) start(() => updateOrderStatusAction(id, "DELIVERED")); }}
      className="btn h-16 w-full bg-emerald-600 text-lg text-white hover:bg-emerald-700">{p ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />} تم التوصيل واستلمت {total}</button>
  );
}
