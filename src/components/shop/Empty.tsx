import Link from "next/link";
import { SearchX } from "lucide-react";

export function Empty({ title, sub, cta = "رجوع للرئيسية", href = "/" }: { title: string; sub?: string; cta?: string; href?: string }) {
  return (
    <div className="card mx-auto flex max-w-lg flex-col items-center gap-3 p-10 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-50 text-brand-600"><SearchX className="h-9 w-9" /></span>
      <h2 className="text-xl font-black">{title}</h2>
      {sub && <p className="text-ink-mute">{sub}</p>}
      <Link href={href} className="btn-primary mt-2">{cta}</Link>
    </div>
  );
}
