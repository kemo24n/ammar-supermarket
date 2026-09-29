import type { OrderStatus } from "@/db/schema";

export const STATUS_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

export const STATUS: Record<OrderStatus, { label: string; short: string; tone: string; dot: string; desc: string }> = {
  PENDING:          { label: "بانتظار التأكيد", short: "جديد",      tone: "bg-amber-50 text-amber-700 ring-amber-200",   dot: "bg-amber-500",   desc: "استلمنا طلبك وسيتم تأكيده خلال دقائق" },
  CONFIRMED:        { label: "تم التأكيد",      short: "مؤكد",      tone: "bg-sky-50 text-sky-700 ring-sky-200",         dot: "bg-sky-500",     desc: "تم تأكيد طلبك وهو على قائمة التجهيز" },
  PREPARING:        { label: "قيد التجهيز",     short: "تجهيز",     tone: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500",  desc: "فريقنا يجهّز سلتك الآن بعناية" },
  OUT_FOR_DELIVERY: { label: "في الطريق إليك",  short: "بالطريق",   tone: "bg-brand-50 text-brand-700 ring-brand-200",   dot: "bg-brand-600",   desc: "السائق انطلق بطلبك" },
  DELIVERED:        { label: "تم التوصيل",      short: "مُسلّم",     tone: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500", desc: "وصل طلبك — صحتين وعافية!" },
  CANCELLED:        { label: "ملغي",            short: "ملغي",      tone: "bg-zinc-100 text-zinc-600 ring-zinc-200",     dot: "bg-zinc-400",    desc: "تم إلغاء الطلب" },
};

export const PAYMENT_LABEL = { COD_SYP: "كاش عند الاستلام (ليرة)", COD_USD: "كاش عند الاستلام (دولار)" } as const;
