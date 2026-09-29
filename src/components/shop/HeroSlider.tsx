"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Banknote, Clock, ShieldCheck } from "lucide-react";
import { Mark } from "@/components/ui/Logo";
import { cn } from "@/lib/format";

type B = { id: string; title: string; subtitle: string | null; cta: string; href: string; image: string | null; theme: string };

export function HeroSlider({ banners }: { banners: B[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const n = banners.length;
  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5500);
    return () => clearInterval(t);
  }, [n, paused]);
  if (!n) return null;
  const go = (d: number) => setI((x) => (x + d + n) % n);

  return (
    <section className="container-x pt-3 md:pt-5">
      <div
        className="relative h-[260px] overflow-hidden rounded-[1.75rem] sm:h-[380px] md:h-[420px] md:rounded-[2rem]"
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; setPaused(true); }}
        onTouchEnd={(e) => { if (touch.current != null) { const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1); } touch.current = null; setPaused(false); }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      >
        {banners.map((b, k) => {
          const dark = b.theme !== "light";
          const active = k === i;
          return (
            <div key={b.id} className={cn("absolute inset-0 transition-all duration-700 ease-out", active ? "opacity-100" : "pointer-events-none opacity-0")} aria-hidden={!active}>
              <div className={cn("absolute inset-0", b.theme === "red" ? "bg-brand-600" : b.theme === "dark" ? "bg-ink" : "bg-white")} />
              {b.image && (
                <div className="absolute inset-y-0 left-0 w-full overflow-hidden sm:w-[58%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image.includes("unsplash") ? `${b.image}?w=1400&h=900&fit=crop&auto=format&q=75` : b.image} alt="" className={cn("h-full w-full object-cover transition-transform duration-[6000ms] ease-out", active ? "scale-110" : "scale-100")} />
                  <div className={cn("absolute inset-0", b.theme === "red" ? "bg-gradient-to-l from-brand-600 via-brand-600/80 to-brand-600/20" : b.theme === "dark" ? "bg-gradient-to-l from-ink via-ink/80 to-ink/20" : "bg-gradient-to-l from-white via-white/85 to-white/10")} />
                </div>
              )}
              {b.theme === "red" && <div className="stripes absolute inset-y-0 right-0 w-1/2 opacity-40" />}
              <div className={cn("relative flex h-full flex-col justify-center p-6 sm:w-[60%] sm:p-12", active && "stagger")}>
                <span className={cn("mb-3 inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-black sm:mb-4 sm:text-xs", dark ? "bg-white/15 text-white ring-1 ring-white/25" : "bg-brand-50 text-brand-700")}>
                  <Mark className="h-4 w-4 sm:h-5 sm:w-5" /> عمار للتسوق · حلب
                </span>
                <h1 className={cn("max-w-[15ch] text-[30px] font-black leading-[1.2] sm:text-5xl lg:text-[3.5rem]", dark ? "text-white" : "text-ink")}>{b.title}</h1>
                {b.subtitle && <p className={cn("mt-2 hidden line-clamp-2 max-w-md sm:block text-[13px] leading-6 sm:mt-4 sm:text-lg sm:leading-8", dark ? "text-white/85" : "text-ink-soft")}>{b.subtitle}</p>}
                <div className="mt-4 sm:mt-7">
                  <Link href={b.href} className={cn("btn h-11 px-5 text-sm sm:h-14 sm:px-7 sm:text-base", b.theme === "red" ? "bg-white text-brand-700 hover:bg-brand-50" : "bg-brand-600 text-white shadow-pop hover:bg-brand-700")}>
                    {b.cta} <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-4 left-5 flex gap-1.5">
          {banners.map((b, k) => (
            <button key={b.id} onClick={() => setI(k)} aria-label={`شريحة ${k + 1}`} className="relative h-2 overflow-hidden rounded-full bg-white/40 transition-all" style={{ width: k === i ? 34 : 8 }}>
              {k === i && <span key={`${i}-${paused}`} className="absolute inset-y-0 right-0 bg-white" style={{ animation: paused ? "none" : "grow 5.5s linear forwards", width: paused ? "100%" : undefined }} />}
            </button>
          ))}
        </div>
      </div>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        {[
          { Icon: Clock, t: "توصيل سريع", s: "خلال 20–50 دقيقة" },
          { Icon: Banknote, t: "ادفع عند الاستلام", s: "ليرة أو دولار" },
          { Icon: ShieldCheck, t: "طازج ومضمون", s: "استبدال فوري" },
        ].map(({ Icon, t, s }) => (
          <div key={t} className="flex shrink-0 items-center gap-2.5 rounded-2xl bg-white py-2.5 pl-4 pr-2.5 ring-1 ring-ink-line sm:p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 sm:h-11 sm:w-11"><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
            <div className="whitespace-nowrap"><div className="text-[13px] font-black sm:text-sm">{t}</div><div className="text-[11px] text-ink-mute sm:text-xs">{s}</div></div>
          </div>
        ))}
      </div>
    </section>
  );
}
