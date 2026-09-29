"use client";
// Tiny, dependency-free micro-interactions.

export function haptic(ms = 12) {
  try { if ("vibrate" in navigator) navigator.vibrate(ms); } catch { /* noop */ }
}

function visibleTarget(): HTMLElement | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]"));
  return els.find((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight; }) ?? null;
}

/** Flies a thumbnail from `from` into the visible cart button, then pulses it. */
export function flyToCart(from: Element | null) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = visibleTarget();
  if (!from || !target) return;
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = Math.min(a.width, a.height, 90);
  const ghost = document.createElement("div");
  const img = from.querySelector("img");
  ghost.style.cssText = `position:fixed;z-index:9999;pointer-events:none;left:${a.left + a.width / 2 - size / 2}px;top:${a.top + a.height / 2 - size / 2}px;width:${size}px;height:${size}px;border-radius:18px;overflow:hidden;box-shadow:0 12px 30px -8px rgba(225,26,33,.55);background:#E11A21 center/cover no-repeat;${img ? `background-image:url("${img.currentSrc || img.src}")` : ""}`;
  document.body.appendChild(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = ghost.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(.7)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(.18)`, opacity: 0.6 },
    ],
    { duration: 650, easing: "cubic-bezier(.5,0,.3,1)" },
  );
  anim.onfinish = () => {
    ghost.remove();
    target.animate([{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
  };
}
