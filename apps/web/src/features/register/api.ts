import { apiFetch } from "@/lib/api";
import type { RegistrationResult } from "./schema";

export type Capacity = { data: { onsite: { taken: number; limit: number; full: boolean } } };

export const fetchCapacity = () => apiFetch<Capacity>("/capacity");

export const requestOtp = (phone: string) =>
  apiFetch<{ resend_after: number }>("/otp", { method: "POST", body: JSON.stringify({ phone }) });

/** Goes through the Next route handler, which stores the Sanctum token in an httpOnly cookie. */
export const submitRegistration = (payload: unknown) =>
  apiFetch<RegistrationResult>("/api/registration", { method: "POST", body: JSON.stringify(payload), base: "" });
