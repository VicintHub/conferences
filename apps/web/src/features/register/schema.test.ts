import { describe, expect, it } from "vitest";
import type { z } from "zod";
import { aboutSchema, attendanceSchema, initialDraft, otpSchema, toPayload } from "./schema";

type AboutValues = z.infer<typeof aboutSchema>;
const about: AboutValues = {
  full_name: "Adebayo Ogunleye",
  country: "NG",
  phone_national: "803 456 7821",
  email: "",
  church: "",
  location: "",
  age_band: "18-45",
};

describe("registration schemas", () => {
  it("accepts a valid About step with optional fields empty", () => {
    expect(aboutSchema.safeParse(about).success).toBe(true);
  });
  it("rejects a short phone number and a bad email", () => {
    const r = aboutSchema.safeParse({ ...about, phone_national: "123", email: "nope" });
    expect(r.success).toBe(false);
    const paths = r.error!.issues.map((i) => i.path[0]);
    expect(paths).toContain("phone_national");
    expect(paths).toContain("email");
  });
  it("needs at least one day", () => {
    expect(attendanceSchema.safeParse({ mode: "online", days: [], needs_accommodation: false }).success).toBe(false);
  });
  it("needs a 6-digit code and consent", () => {
    expect(otpSchema.safeParse({ code: "12345", consent: true }).success).toBe(false);
    expect(otpSchema.safeParse({ code: "123456", consent: false }).success).toBe(false);
    expect(otpSchema.safeParse({ code: "123456", consent: true }).success).toBe(true);
  });
  it("maps the draft to the API payload", () => {
    const p = toPayload({ ...initialDraft, ...about, country: "NG" }, "123456");
    expect(p).toMatchObject({ phone: "+2348034567821", email: null, consent: true, code: "123456", mode: "onsite" });
    expect(p.days).toHaveLength(6);
  });
});
