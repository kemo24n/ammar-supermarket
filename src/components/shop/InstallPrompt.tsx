"use client";
import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Mark } from "@/components/ui/Logo";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = "ammar-install-dismissed";

/** Registers the service worker and offers "add to home screen" (Android prompt / iOS hint). */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BIP | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") navigator.serviceWorker.register("/sw.js").catch(() => {});
    let dismissed = false;
    try { dismissed = Number(localStorage.getItem(KEY) ?? 0) > Date.now() - 7 * 86400000; } catch { /* ignore */ }
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
    if (dismissed || standalone) return;
    const onBip = (e: Event) => { e.preventDefault(); setEvt(e as BIP); setTimeout(() => setShow(true), 4000); };
    window.addEventListener("beforeinstallprompt", onBip);
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    if (isIos) { setIos(true); const t = setTimeout(() => setShow(true), 6000); return () => { clearTimeout(t); window.removeEventListener("beforeinstallprompt", onBip); }; }
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!show) return null;
  const close = () => { setShow(false); try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ } };
  return (
    <div className="fixed inset-x-3 top-3 z-[55] animate-[rise_.4s_ease] md:hidden">
      <div className="flex items-center gap-3 rounded-2xl bg-ink p-3 text-white shadow-2xl">
        <Mark className="h-11 w-11 shrink-0" />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-sm font-black">ثبّت تطبيق عمار على موبايلك</div>
          <div className="text-[11px] text-white/70">{ios ? <>اضغط <Share className="inline h-3 w-3" /> ثم «إضافة إلى الشاشة الرئيسية»</> : "طلب أسرع بكبسة وحدة من الشاشة الرئيسية"}</div>
        </div>
        {!ios && evt && <button onClick={async () => { await evt.prompt(); close(); }} className="btn-sm btn h-9 bg-brand-600 text-white"><Download className="h-4 w-4" /> تثبيت</button>}
        <button onClick={close} className="text-white/60" aria-label="إغلاق"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
