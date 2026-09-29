import { CatIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/format";

/** Real photo when available; otherwise an on-brand tile (so a catalogue without photos still looks designed). */
export function ProductImage({ src, name, icon, className, size = 400 }: { src?: string | null; name: string; icon?: string | null; className?: string; size?: number }) {
  if (src) {
    const url = src.includes("images.unsplash.com") ? `${src}${src.includes("?") ? "&" : "?"}w=${size}&h=${size}&fit=crop&auto=format&q=70` : src;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
  }
  return (
    <div className={cn("relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 to-white stripes-red", className)}>
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-brand-600/10" />
      <div className="flex flex-col items-center gap-2 px-3 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-card">
          <CatIcon name={icon} className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <span className="line-clamp-2 text-[11px] font-bold text-ink-mute">{name}</span>
      </div>
    </div>
  );
}
