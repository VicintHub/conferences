import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterFlow } from "./RegisterFlow";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function mockApi(capacity = { taken: 1846, limit: 2500, full: false }) {
  const calls: { url: string; body?: unknown }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, body: init?.body ? JSON.parse(init.body as string) : undefined });
      if (url.endsWith("/capacity")) return json({ data: { onsite: capacity } });
      if (url.endsWith("/otp")) return json({ resend_after: 60 }, 202);
      if (url.endsWith("/api/registration"))
        return json(
          {
            data: {
              claim_code: "JC27-DLG-48213",
              category: "delegate",
              mode: "onsite",
              attendee: { first_name: "Adebayo", full_name: "Adebayo Ogunleye", phone: "+2348034567821" },
            },
            meta: { downgraded_to_online: false },
          },
          201,
        );
      return json({}, 404);
    }),
  );
  return calls;
}

const renderFlow = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RegisterFlow />
    </QueryClientProvider>,
  );

const next = (name = "Continue") => fireEvent.click(screen.getByRole("button", { name }));

async function toAttendance() {
  next();
  fireEvent.change(await screen.findByLabelText(/full name/i), { target: { value: "Adebayo Ogunleye" } });
  fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "803 456 7821" } });
  next();
  await screen.findByText("How will you attend?", { selector: "h1" });
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe("RegisterFlow", () => {
  it("validates the About step before moving on", async () => {
    mockApi();
    renderFlow();
    next();
    await screen.findByText("About you", { selector: "h1" });
    next();
    expect(await screen.findByText("Enter your full name")).toBeInTheDocument();
    expect(screen.getByText("About you", { selector: "h1" })).toBeInTheDocument();
  });

  it("shows the live capacity meter", async () => {
    mockApi();
    renderFlow();
    await toAttendance();
    expect(await screen.findByText(/1,846 \/ 2,500 onsite places taken/i)).toBeInTheDocument();
  });

  it("disables onsite and defaults to online when the cap is full", async () => {
    mockApi({ taken: 2500, limit: 2500, full: true });
    renderFlow();
    await toAttendance();
    expect(await screen.findByText(/onsite places are full/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /onsite in ibadan/i })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /^online/i })).toBeChecked();
  });

  it("registers end to end, then offers notifications", async () => {
    const calls = mockApi();
    renderFlow();
    await toAttendance();
    next();
    await screen.findByText("Enter the code", { selector: "h1" });
    expect(calls.find((c) => c.url.endsWith("/otp"))?.body).toEqual({ phone: "+2348034567821" });
    expect(screen.getByText(/resend in 1:00/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Digit 1"), { target: { value: "482100" } });
    fireEvent.click(screen.getByRole("checkbox"));
    next("Finish registration");

    expect(await screen.findByText("You’re in, Adebayo")).toBeInTheDocument();
    expect(screen.getByText("JC27-DLG-48213")).toBeInTheDocument();
    expect(await screen.findByText("Stay in the loop")).toBeInTheDocument();
    const reg = calls.find((c) => c.url.endsWith("/api/registration"))!.body as Record<string, unknown>;
    expect(reg).toMatchObject({ phone: "+2348034567821", code: "482100", consent: true, mode: "onsite", category: "delegate" });
    await waitFor(() => expect(JSON.parse(localStorage.getItem("jc27.ticket")!).claim_code).toBe("JC27-DLG-48213"));
  });

  it("requires consent before submitting the code", async () => {
    mockApi();
    renderFlow();
    await toAttendance();
    next();
    await screen.findByText("Enter the code", { selector: "h1" });
    fireEvent.change(screen.getByLabelText("Digit 1"), { target: { value: "482100" } });
    next("Finish registration");
    expect(await screen.findByText("Please agree to continue")).toBeInTheDocument();
  });
});
