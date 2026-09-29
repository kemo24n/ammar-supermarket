// Hand-built brand illustrations (flat, red / ink / cream). Pure SVG + CSS — no image files.
type P = { className?: string };

const RED = "#E11A21", DEEP = "#9C1318", INK = "#16161A", CREAM = "#FFF1F1", SOFT = "#FFE0E0", LEAF = "#2E9E5B", SUN = "#F6B73C";

function Basket({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M8 26 Q40 -14 72 26" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M0 26 H80 L70 70 Q69 74 65 74 H15 Q11 74 10 70 Z" fill={RED} />
      <g stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".9">
        <path d="M18 36 L24 64" /><path d="M32 36 L36 64" /><path d="M48 36 L44 64" /><path d="M62 36 L56 64" />
      </g>
      <rect x="-3" y="22" width="86" height="8" rx="4" fill={DEEP} />
    </g>
  );
}

export const Illus = {
  /** Empty cart */
  EmptyBasket: ({ className }: P) => (
    <svg viewBox="0 0 200 180" className={className} aria-hidden>
      <ellipse cx="100" cy="160" rx="62" ry="8" fill={INK} opacity=".08" />
      <circle cx="100" cy="86" r="70" fill={CREAM} />
      <g className="origin-center animate-[floaty_3.2s_ease-in-out_infinite]"><Basket x={60} y={62} /></g>
      <circle cx="46" cy="44" r="5" fill={SUN} /><circle cx="160" cy="58" r="4" fill={RED} opacity=".5" /><path d="M150 30 l4 8 8 4 -8 4 -4 8 -4 -8 -8 -4 8 -4z" fill={SUN} />
    </svg>
  ),

  /** Search with no results */
  NoResults: ({ className }: P) => (
    <svg viewBox="0 0 200 180" className={className} aria-hidden>
      <ellipse cx="100" cy="162" rx="58" ry="7" fill={INK} opacity=".08" />
      <circle cx="100" cy="84" r="68" fill={CREAM} />
      <g className="animate-[wiggle_2.6s_ease-in-out_infinite]" style={{ transformOrigin: "100px 90px" }}>
        <circle cx="90" cy="78" r="30" fill="#fff" stroke={INK} strokeWidth="7" />
        <path d="M112 100 L138 126" stroke={INK} strokeWidth="11" strokeLinecap="round" />
        <path d="M112 100 L138 126" stroke={RED} strokeWidth="5" strokeLinecap="round" />
        <path d="M80 72 q4 -5 8 0 M94 72 q4 -5 8 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M82 90 q9 -6 18 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  ),

  /** Delivery scooter (used for "on the way" + hero band) */
  Scooter: ({ className }: P) => (
    <svg viewBox="0 0 240 170" className={className} aria-hidden>
      <ellipse cx="120" cy="152" rx="90" ry="8" fill={INK} opacity=".1" />
      <g className="animate-[speed_1.4s_linear_infinite]" stroke={INK} strokeWidth="4" strokeLinecap="round" opacity=".25">
        <path d="M10 92 H44" /><path d="M20 110 H52" /><path d="M4 128 H36" />
      </g>
      <g className="animate-[bob_.6s_ease-in-out_infinite]">
        {/* box */}
        <rect x="58" y="44" width="58" height="50" rx="8" fill={RED} />
        <rect x="58" y="44" width="58" height="12" rx="6" fill={DEEP} />
        <circle cx="87" cy="72" r="11" fill="#fff" /><path d="M81 69 l5 7 8 -9" stroke={RED} strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* body */}
        <path d="M60 110 H150 Q160 110 166 100 L178 72 H190" stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M112 110 Q118 92 140 92 H160" stroke={RED} strokeWidth="14" fill="none" strokeLinecap="round" />
        {/* rider */}
        <circle cx="146" cy="36" r="13" fill={INK} /><path d="M136 34 a11 11 0 0 1 21 -4" stroke={RED} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M144 50 L136 84 H160" stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M146 58 L176 70" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      </g>
      {/* wheels */}
      {[74, 176].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="126" r="20" fill={INK} /><circle cx={cx} cy="126" r="8" fill="#fff" />
          <g className="animate-spin" style={{ transformOrigin: `${cx}px 126px`, animationDuration: ".6s" }}><path d={`M${cx} 112 V140 M${cx - 14} 126 H${cx + 14}`} stroke="#fff" strokeWidth="3" opacity=".6" /></g>
        </g>
      ))}
    </svg>
  ),

  /** Order placed — basket with confetti burst */
  Success: ({ className }: P) => (
    <svg viewBox="0 0 220 190" className={className} aria-hidden>
      <circle cx="110" cy="96" r="78" fill="#fff" opacity=".14" />
      <circle cx="110" cy="96" r="58" fill="#fff" opacity=".2" />
      <g className="animate-[popin_.7s_cubic-bezier(.2,1.6,.4,1)_both]"><Basket x={70} y={62} /></g>
      <g className="animate-[popin_.6s_.35s_cubic-bezier(.2,1.6,.4,1)_both]" style={{ transformOrigin: "150px 60px" }}>
        <circle cx="150" cy="60" r="20" fill={LEAF} /><path d="M140 60 l7 8 13 -15" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {[[30, 40, SUN], [190, 30, "#fff"], [20, 120, "#fff"], [200, 120, SUN], [60, 20, "#fff"], [170, 160, "#fff"], [45, 165, SUN]].map(([x, y, c], i) => (
        <rect key={i} x={x as number} y={y as number} width="9" height="9" rx="2" fill={c as string} className="animate-[confetti_1.2s_ease-out_both]" style={{ animationDelay: `${0.2 + i * 0.07}s`, transformOrigin: "110px 96px" }} />
      ))}
    </svg>
  ),

  /** Fresh produce basket (hero / produce band) */
  Fresh: ({ className }: P) => (
    <svg viewBox="0 0 220 180" className={className} aria-hidden>
      <ellipse cx="110" cy="164" rx="80" ry="8" fill={INK} opacity=".1" />
      <g className="animate-[floaty_4s_ease-in-out_infinite]">
        <circle cx="78" cy="78" r="24" fill={RED} /><path d="M78 56 q6 -12 16 -10 q-4 10 -16 10" fill={LEAF} />
        <circle cx="122" cy="70" r="22" fill={SUN} /><path d="M122 50 v-8" stroke={LEAF} strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="150" cy="96" rx="12" ry="30" fill="#7A3E9D" transform="rotate(35 150 96)" /><path d="M163 72 q8 -6 12 -2" stroke={LEAF} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M60 104 l30 -40 8 6 -30 40z" fill="#F08A24" /><path d="M90 62 l6 -10 m2 12 l10 -6" stroke={LEAF} strokeWidth="4" strokeLinecap="round" />
      </g>
      <Basket x={40} y={88} s={1.75} />
    </svg>
  ),

  /** Loyalty gift */
  Gift: ({ className }: P) => (
    <svg viewBox="0 0 160 160" className={className} aria-hidden>
      <g className="animate-[floaty_3.4s_ease-in-out_infinite]">
        <rect x="30" y="66" width="100" height="70" rx="10" fill={RED} />
        <rect x="24" y="50" width="112" height="24" rx="8" fill={DEEP} />
        <rect x="72" y="50" width="16" height="86" fill={SUN} />
        <path d="M80 50 q-30 -34 -38 -8 q-2 10 38 8 q40 2 38 -8 q-8 -26 -38 8" fill="none" stroke={SUN} strokeWidth="7" strokeLinejoin="round" />
      </g>
      <path d="M22 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z M138 28 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" className="animate-pulse" />
    </svg>
  ),
};

export { SOFT };
