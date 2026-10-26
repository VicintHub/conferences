import { NextResponse, type NextRequest } from "next/server";

const API = () => process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_COOKIE = "jc27_token";

/** Only what the signed-in app needs; everything else stays unreachable through the proxy. */
const ALLOWED: [method: string, pattern: RegExp][] = [
  ["GET", /^me$/],
  ["PATCH", /^me\/registration$/],
  ["GET", /^programme$/],
  ["POST", /^auth\/logout$/],
];

/**
 * Backend-for-frontend: attaches the Sanctum token from the httpOnly cookie, so client code never handles it.
 */
async function handle(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  if (!ALLOWED.some(([m, re]) => m === request.method && re.test(path))) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const publicPath = path === "programme";
  if (!token && !publicPath) return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });

  let upstream: Response;
  try {
    upstream = await fetch(`${API()}/${path}`, {
      method: request.method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Can't reach the server.", code: "network" }, { status: 502 });
  }

  const res =
    upstream.status === 204
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json(await upstream.json().catch(() => ({})), { status: upstream.status });
  // A rejected token or an explicit sign-out ends the session on this device.
  if (upstream.status === 401 || path === "auth/logout") res.cookies.delete(TOKEN_COOKIE);
  return res;
}

export { handle as GET, handle as PATCH, handle as POST };
