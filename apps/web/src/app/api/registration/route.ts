import { NextResponse } from "next/server";

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_COOKIE = "jc27_token";

/**
 * Proxies registration to the Laravel API and keeps the Sanctum token in an httpOnly cookie,
 * so it never reaches client-side JavaScript.
 */
export async function POST(request: Request) {
  let upstream: Response;
  try {
    upstream = await fetch(`${API}/registrations`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Can't reach the server. Try again shortly.", code: "network" }, { status: 502 });
  }

  const body = await upstream.json().catch(() => ({}));
  if (!upstream.ok) return NextResponse.json(body, { status: upstream.status });

  const { token, ...meta } = body.meta ?? {};
  const res = NextResponse.json({ ...body, meta }, { status: upstream.status });
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
