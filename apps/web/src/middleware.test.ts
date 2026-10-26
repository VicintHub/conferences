import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, middleware } from "./middleware";

const req = (path: string, cookie?: string) => new NextRequest(`http://localhost${path}`, { headers: cookie ? { cookie } : {} });

describe("app route guard", () => {
  it("redirects signed-out visitors to login, remembering where they were going", () => {
    const res = middleware(req("/app/pass"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/login?next=%2Fapp%2Fpass");
  });
  it("lets signed-in visitors through", () => {
    expect(middleware(req("/app", "jc27_token=abc")).headers.get("location")).toBeNull();
  });
  it("only guards the app", () => {
    expect(config.matcher).toEqual(["/app/:path*"]);
  });
});
