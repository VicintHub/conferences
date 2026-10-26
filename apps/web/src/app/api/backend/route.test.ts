import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, PATCH, POST } from "./[...path]/route";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const req = (method: string, path: string, token?: string, body?: object) =>
  new NextRequest(`http://localhost/api/backend/${path}`, {
    method,
    headers: token ? { cookie: `jc27_token=${token}` } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
const ctx = (path: string) => ({ params: Promise.resolve({ path: path.split("/") }) });

afterEach(() => vi.unstubAllGlobals());

describe("backend proxy", () => {
  it("adds the bearer token from the cookie", async () => {
    const f = vi.fn().mockResolvedValue(json({ data: { claim_code: "X" } }));
    vi.stubGlobal("fetch", f);
    const res = await GET(req("GET", "me", "1|abc"), ctx("me"));
    expect(res.status).toBe(200);
    expect(f.mock.calls[0][0]).toMatch(/\/me$/);
    expect(f.mock.calls[0][1].headers.Authorization).toBe("Bearer 1|abc");
  });

  it("refuses private paths without a cookie, but serves the public programme", async () => {
    const f = vi.fn().mockResolvedValue(json({ data: [] }));
    vi.stubGlobal("fetch", f);
    expect((await GET(req("GET", "me"), ctx("me"))).status).toBe(401);
    expect(f).not.toHaveBeenCalled();
    expect((await GET(req("GET", "programme"), ctx("programme"))).status).toBe(200);
    expect(f.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("only exposes allow-listed method and path pairs", async () => {
    vi.stubGlobal("fetch", vi.fn());
    expect((await GET(req("GET", "auth/verify", "t"), ctx("auth/verify"))).status).toBe(404);
    expect((await POST(req("POST", "me", "t"), ctx("me"))).status).toBe(404);
    expect((await GET(req("GET", "registrations", "t"), ctx("registrations"))).status).toBe(404);
  });

  it("forwards PATCH bodies", async () => {
    const f = vi.fn().mockResolvedValue(json({ data: { mode: "online" } }));
    vi.stubGlobal("fetch", f);
    const res = await PATCH(req("PATCH", "me/registration", "t", { mode: "online" }), ctx("me/registration"));
    expect(res.status).toBe(200);
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ mode: "online" });
  });

  it("ends the session when the API rejects the token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ message: "Unauthenticated." }, 401)));
    const res = await GET(req("GET", "me", "stale"), ctx("me"));
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toMatch(/jc27_token=;/);
  });

  it("clears the cookie on sign-out and passes a 204 through", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    const res = await POST(req("POST", "auth/logout", "t"), ctx("auth/logout"));
    expect(res.status).toBe(204);
    expect(res.headers.get("set-cookie")).toMatch(/jc27_token=;/);
  });

  it("returns 502 when the API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect((await GET(req("GET", "me", "t"), ctx("me"))).status).toBe(502);
  });
});
