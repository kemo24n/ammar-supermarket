"use client";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useFavs } from "@/store/favs";
import { toggleFavoriteAction } from "@/app/actions/favorites";
import { haptic } from "@/lib/fx";
import { cn } from "@/lib/format";
import { useStore } from "./StoreProvider";



export function FavButton({ id, className, size = "sm" }: { id: string; className?: string; size?: "sm" | "lg" }) {
  const { user } = useStore();
  const router = useRouter();
  const on = useFavs((s) => s.ids.has(id));
  const setFav = useFavs((s) => s.set);
  return (
    <button
      aria-label={on ? "إزالة من المفضلة" : "أضف للمفضلة"} aria-pressed={on}
      onClick={async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) { router.push("/login?next=/account"); return; }
        haptic(10); setFav(id, !on);
        const r = await toggleFavoriteAction(id, !on);
        if (!r.ok) setFav(id, on);
      }}
      className={cn("grid place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition active:scale-90", size === "lg" ? "h-12 w-12" : "h-8 w-8", className)}>
      <Heart className={cn("transition", size === "lg" ? "h-6 w-6" : "h-4 w-4", on ? "scale-110 fill-brand-600 text-brand-600" : "text-ink-mute")} />
    </button>
  );
}
