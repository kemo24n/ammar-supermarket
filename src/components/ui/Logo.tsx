import Link from "next/link";
import { cn } from "@/lib/format";

export function Mark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <clipPath id="ammar-basket-c"><path d="M25.5 35 L83 45.5 Q84.6 46 83.8 47.6 L71.5 69 Q70.6 70.4 68.9 70.4 L41.2 70.4 Q39.4 70.4 38.8 68.8 Z" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="50" fill="#E11A21" />
      <g clipPath="url(#ammar-basket-c)">
        <g fill="#fff" transform="skewX(28) translate(-24 0)">
          {[24, 35, 46, 57, 68, 79].map((x) => <rect key={x} x={x} y={20} width={6.6} height={60} />)}
        </g>
      </g>
      <path d="M15.5 31.5 C17.5 25.8 24.6 25.4 26.6 30.6 L28.4 37" fill="none" stroke="#fff" strokeWidth={4.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/", light = false, sub = true, className }: { href?: string; light?: boolean; sub?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 shrink-0", className)} aria-label="عمار للتسوق — الرئيسية">
      <Mark className="h-11 w-11 drop-shadow-[0_6px_14px_rgba(225,26,33,.35)]" />
      <span className="leading-none">
        <span className={cn("block text-[22px] font-black tracking-tight", light ? "text-white" : "text-brand-600")}>عمار للتسوق</span>
        {sub && <span className={cn("mt-1 block text-[11px] font-bold", light ? "text-white/70" : "text-ink-mute")}>سوبر ماركت · حلب</span>}
      </span>
    </Link>
  );
}
