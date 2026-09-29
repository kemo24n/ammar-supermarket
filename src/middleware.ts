import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const s = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const deny = (to: string) => {
    const url = req.nextUrl.clone();
    url.pathname = to;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  };
  if (pathname.startsWith("/admin") && !(s && (s.role === "ADMIN" || s.role === "STAFF"))) return deny("/staff-login");
  if (pathname.startsWith("/driver") && !(s && (s.role === "DRIVER" || s.role === "ADMIN"))) return deny("/staff-login");
  if (pathname.startsWith("/account") && !s) return deny("/login");
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/driver/:path*", "/account/:path*"] };
