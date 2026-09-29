import { cn } from "@/lib/format";
import { STATUS } from "@/lib/status";
import type { OrderStatus } from "@/db/schema";

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-black sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-sm text-ink-mute">{sub}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn("chip whitespace-nowrap", STATUS[status].tone)}><span className={cn("h-1.5 w-1.5 rounded-full", STATUS[status].dot)} />{STATUS[status].label}</span>;
}

export function Panel({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("card p-5", className)}>
      {(title || actions) && <div className="mb-4 flex items-center justify-between gap-2"><h2 className="font-black">{title}</h2>{actions}</div>}
      {children}
    </section>
  );
}
