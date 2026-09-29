import { requireRole } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";
import { AutoRefresh } from "@/components/shop/AutoRefresh";
import { LogOut } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "تطبيق السائق", robots: { index: false } };

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const u = await requireRole(["DRIVER", "ADMIN"], "/staff-login");
  return (
    <div className="min-h-screen bg-paper">
      <AutoRefresh every={20000} />
      <header className="sticky top-0 z-20 bg-ink text-white">
        <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
          <Logo href="/driver" light sub={false} />
          <div className="flex items-center gap-3 text-sm"><span className="font-bold">{u.name.split(" —")[0]}</span>
            <form action={logoutAction}><button className="grid h-9 w-9 place-items-center rounded-xl bg-white/10" aria-label="خروج"><LogOut className="h-4 w-4" /></button></form></div>
        </div>
      </header>
      <main className="mx-auto max-w-xl p-4">{children}</main>
    </div>
  );
}
