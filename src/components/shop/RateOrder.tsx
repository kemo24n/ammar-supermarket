"use client";
import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { rateOrderAction } from "@/app/actions/rate";
import { cn } from "@/lib/format";

export function RateOrder({ code, token, initial }: { code: string; token: string; initial: number | null }) {
  const [v, setV] = useState(initial ?? 0);
  const [hover, setHover] = useState(0);
  const [pending, start] = useTransition();
  return (
    <div className="card p-5 text-center">
      <h3 className="font-black">{initial ? "شكراً لتقييمك!" : "كيف كانت تجربتك؟"}</h3>
      <div className="mt-3 flex justify-center gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((k) => (
          <button key={k} disabled={pending} onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(0)}
            onClick={() => { setV(k); start(() => rateOrderAction(code, token, k)); }} aria-label={`${k} نجوم`}>
            <Star className={cn("h-8 w-8 transition", (hover || v) >= k ? "fill-amber-400 text-amber-400" : "text-zinc-300")} />
          </button>
        ))}
      </div>
    </div>
  );
}
