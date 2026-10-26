import { NextResponse, type NextRequest } from "next/server";

/** Cheap gate: no session cookie, no app or console. The API still validates the token on every call. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (admin) {
    // The sign-in screens are the only public part of the console.
    if (pathname === "/admin/login" || pathname === "/admin/verify" || request.cookies.has("jc27_staff")) return NextResponse.next();
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (request.cookies.has("jc27_token")) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/app/:path*", "/admin", "/admin/:path*"] };
