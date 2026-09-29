export type Currency = "SYP" | "USD";

const nf = new Intl.NumberFormat("en-US");

export function syp(amount: number) {
  return `${nf.format(Math.round(amount))} ل.س`;
}

export function usd(amount: number, rate: number) {
  const v = amount / Math.max(rate, 1);
  return `$${v.toFixed(v >= 100 ? 0 : 2)}`;
}

export function money(amount: number, currency: Currency, rate: number) {
  return currency === "USD" ? usd(amount, rate) : syp(amount);
}

export function num(n: number) {
  return nf.format(n);
}

export function discountPct(price: number, compare?: number | null) {
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}

export function dateAr(d: Date | string, withTime = true) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar-SY-u-nu-latn", {
    day: "numeric", month: "short", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "Asia/Damascus",
  }).format(date);
}

export function timeAgo(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "الآن";
  const m = Math.floor(s / 60);
  if (m < 60) return `منذ ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} س`;
  return dateAr(date, false);
}

/** Normalise Syrian phone numbers to 9639XXXXXXXX (digits only). Accepts 09.., 9639.., +9639.., Arabic digits. */
export function normalizePhone(raw: string) {
  const western = raw.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  let p = western.replace(/\D/g, "");
  if (p.startsWith("00")) p = p.slice(2);
  if (p.startsWith("0")) p = "963" + p.slice(1);
  if (!p.startsWith("963")) p = "963" + p;
  return p;
}

export function prettyPhone(p: string) {
  if (p.startsWith("963") && p.length === 12) return `0${p.slice(3, 6)} ${p.slice(6, 9)} ${p.slice(9)}`;
  return p;
}

export function slugify(s: string) {
  return s.trim().toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || Math.random().toString(36).slice(2, 8);
}

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
