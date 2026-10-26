import { NextResponse, type NextRequest } from "next/server";

const API = () => process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_COOKIE = "jc27_token";

/** [method, path pattern, needs a signed-in attendee]. Everything else stays unreachable through the proxy. */
const ALLOWED: [method: string, pattern: RegExp, auth: boolean][] = [
  ["GET", /^me$/, true],
  ["PATCH", /^me\/registration$/, true],
  ["GET", /^me\/feedback$/, true],
  ["GET", /^programme$/, false],
  ["POST", /^auth\/logout$/, true],
  // Testimonies: reading and submitting are open to guests; the token (if any) personalises Amens.
  ["GET", /^testimonies$/, false],
  ["POST", /^testimonies$/, false],
  ["PUT", /^testimonies\/\d+\/amen$/, true],
  ["DELETE", /^testimonies\/\d+\/amen$/, true],
  ["POST", /^sessions\/\d+\/feedback$/, true],
  ["GET", /^survey$/, true],
  ["POST", /^survey$/, true],
];

/**
 * Backend-for-frontend: attaches the Sanctum token from the httpOnly cookie, so client code never handles it.
 * Request bodies (JSON or multipart uploads) and query strings pass through untouched.
 */
async function handle(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  const rule = ALLOWED.find(([m, re]) => m === request.method && re.test(path));
  if (!rule) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (rule[2] && !token) return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });

  const hasBody = !["GET", "HEAD"].includes(request.method);
  let upstream: Response;
  try {
    upstream = await fetch(`${API()}/${path}${request.nextUrl.search}`, {
      method: request.method,
      headers: {
        Accept: "application/json",
        "Content-Type": request.headers.get("content-type") ?? "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Can't reach the server.", code: "network" }, { status: 502 });
  }

  const res =
    upstream.status === 204
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json(await upstream.json().catch(() => ({})), { status: upstream.status });
  // A rejected token or an explicit sign-out ends the session on this device. Guests hitting open endpoints are unaffected.
  if ((upstream.status === 401 && token) || path === "auth/logout") res.cookies.delete(TOKEN_COOKIE);
  return res;
}

export { handle as DELETE, handle as GET, handle as PATCH, handle as POST, handle as PUT };
