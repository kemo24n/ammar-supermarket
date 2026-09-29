"use client";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useCart } from "@/store/cart";
import { useMounted } from "./StoreProvider";
import { cn } from "@/lib/format";

export function WaFab({ whatsapp }: { whatsapp: string }) {
  const path = usePathname();
  const hasCart = useCart((s) => s.items.length > 0);
  const mounted = useMounted();
  if (path.startsWith("/checkout")) return null;
  const lifted = mounted && hasCart && !path.startsWith("/cart") && !path.startsWith("/order");
  return (
    <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("مرحباً عمار للتسوق، بدي أطلب:")}`} target="_blank" rel="noreferrer"
      className={cn("fixed left-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition-all duration-300 hover:scale-105 md:bottom-6 md:h-14 md:w-14 no-print",
        lifted ? "bottom-[148px]" : "bottom-[88px]")} aria-label="اطلب عبر واتساب">
      <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
    </a>
  );
}
