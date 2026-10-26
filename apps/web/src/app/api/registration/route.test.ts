import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const req = () => new Request("http://localhost/api/registration", { method: "POST", body: JSON.stringify({ phone: "+2348034567821" }) });

afterEach(() => vi.unstubAllGlobals());

describe("POST /api/registration", () => {
  it("moves the token into an httpOnly cookie and strips it from the body", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(json({ data: { claim_code: "JC27-DLG-48213" }, meta: { token: "1|secret", downgraded_to_online: false } }, 201)),
    );
    const res = await POST(req());
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.meta).toEqual({ downgraded_to_online: false });
    expect(JSON.stringify(body)).not.toContain("secret");
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("jc27_token=1%7Csecret");
    expect(cookie.toLowerCase()).toContain("httponly");
  });

  it("forwards API errors without setting a cookie", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json({ message: "That code is incorrect or has expired.", code: "invalid_otp" }, 422)),
    );
    const res = await POST(req());
    expect(res.status).toBe(422);
    expect((await res.json()).code).toBe("invalid_otp");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("returns 502 when the API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect((await POST(req())).status).toBe(502);
  });
});
