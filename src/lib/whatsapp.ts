import "server-only";
import type { Order, Settings } from "@/db/schema";
import type { Quote } from "./orders";
import { PAYMENT_LABEL, STATUS } from "./status";

const n = (v: number) => v.toLocaleString("en-US");

export function orderSummaryText(order: Order, q: Pick<Quote, "lines" | "zone">) {
  const items = q.lines.map((l) => `• ${l.name}${l.grams ? ` (${l.unit})` : ""} × ${l.qty} = ${n(l.lineTotal)} ل.س${l.grams ? " تقريباً" : ""}`).join("\n");
  return [
    `🛒 طلب جديد ${order.code}`,
    `👤 ${order.customerName} — ${order.phone}`,
    `📍 ${q.zone?.name ?? ""} — ${order.addressText}`,
    `🕒 ${order.slot}`,
    "",
    items,
    "",
    `المجموع: ${n(order.subtotal)} ل.س`,
    `التوصيل: ${n(order.deliveryFee)} ل.س`,
    order.discount ? `الخصم: -${n(order.discount)} ل.س` : "",
    order.pointsUsed ? `نقاط مستخدمة: ${order.pointsUsed}` : "",
    `الإجمالي: ${n(order.total)} ل.س (≈ $${(order.total / order.usdRate).toFixed(2)})`,
    `الدفع: ${PAYMENT_LABEL[order.payment]}`,
    order.notes ? `ملاحظات: ${order.notes}` : "",
  ].filter(Boolean).join("\n");
}

/**
 * Sends a WhatsApp message to the store owner for every new order.
 * Uses CallMeBot (free) when CALLMEBOT_PHONE + CALLMEBOT_APIKEY are configured.
 * Swap this for the official WhatsApp Cloud API when the store gets a Business number.
 */
export async function notifyStoreNewOrder(order: Order, q: Quote, _settings: Settings) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(orderSummaryText(order, q))}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try { await fetch(url, { signal: ctrl.signal }); } finally { clearTimeout(t); }
}

/** wa.me deep link — customer → store (backup channel) or store → customer (status updates). */
export function waLink(phoneDigits: string, text: string) {
  return `https://wa.me/${phoneDigits.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export function statusMessageForCustomer(order: Pick<Order, "code" | "customerName" | "status" | "total">, siteUrl: string) {
  const s = STATUS[order.status];
  return `مرحباً ${order.customerName} 👋\nطلبك ${order.code} من عمار للتسوق: ${s.label}.\n${s.desc}\nالإجمالي: ${n(order.total)} ل.س\nتتبع طلبك: ${siteUrl}/order/${order.code}`;
}
