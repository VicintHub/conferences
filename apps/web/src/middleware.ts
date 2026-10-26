import { NextResponse, type NextRequest } from "next/server";

/** Cheap gate: no session cookie, no app. The API still validates the token on every call. */
export function middleware(request: NextRequest) {
  if (request.cookies.has("jc27_token")) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/app/:path*"] };
