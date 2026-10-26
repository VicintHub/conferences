"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { toE164, type CountryIso } from "@/lib/phone";
import { saveTicket } from "@/lib/ticket";
import { AboutStep } from "./AboutStep";
import { AttendanceStep } from "./AttendanceStep";
import { CategoryStep } from "./CategoryStep";
import { Confirmation } from "./Confirmation";
import { Frame } from "./Frame";
import { OtpStep } from "./OtpStep";
import { fetchCapacity, requestOtp, submitRegistration } from "./api";
import { categories, initialDraft, toPayload, type RegistrationDraft, type RegistrationResult } from "./schema";

const titles = ["I’m registering as", "About you", "How will you attend?", "Enter the code"];
const FORM_ID = "register-step";

export function RegisterFlow() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<RegistrationDraft>(initialDraft);
  const [resendAfter, setResendAfter] = useState(60);
  const [otpError, setOtpError] = useState<string>();
  const [phoneError, setPhoneError] = useState<string>();
  const [result, setResult] = useState<RegistrationResult>();

  const capacity = useQuery({ queryKey: ["capacity"], queryFn: fetchCapacity, enabled: step >= 3, refetchInterval: 30_000 });
  const phone = toE164(draft.country as CountryIso, draft.phone_national);

  const sendOtp = useMutation({
    mutationFn: () => requestOtp(phone),
    onSuccess: (r) => {
      setResendAfter(r.resend_after);
      setPhoneError(undefined);
      setStep(4);
    },
    onError: (e: ApiError) => {
      if (e.status === 429) {
        // A code was just sent to this number; carry on to the code screen with the remaining wait.
        setResendAfter(Number(e.body.retry_after ?? 60));
        return setStep(4);
      }
      if (e.status === 422) {
        setPhoneError(e.fieldErrors.phone ?? e.message);
        return setStep(2);
      }
    },
  });

  const register = useMutation({
    mutationFn: (code: string) => submitRegistration(toPayload(draft, code)),
    onSuccess: (r) => {
      saveTicket({ claim_code: r.data.claim_code, first_name: r.data.attendee.first_name, category: r.data.category, mode: r.data.mode });
      setResult(r);
    },
    onError: (e: ApiError) => setOtpError(e.status === 409 ? "This phone number is already registered." : e.message),
  });

  const back = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);
  const onSubmitOtp = useCallback(
    (code: string) => {
      setOtpError(undefined);
      register.mutate(code);
    },
    [register],
  );

  if (result) return <Confirmation result={result} />;

  const categoryLabel = categories.find((c) => c.value === draft.category)?.title ?? "";
  const busy = sendOtp.isPending || register.isPending;
  const nextLabel =
    step === 4 ? (register.isPending ? "Registering…" : "Finish registration") : sendOtp.isPending ? "Sending code…" : "Continue";

  return (
    <Frame
      step={step}
      title={titles[step - 1]}
      categoryLabel={categoryLabel}
      onBack={back}
      footer={
        <>
          {sendOtp.isError && sendOtp.error.status !== 429 && sendOtp.error.status !== 422 && (
            <p role="alert" className="mb-3 text-center text-sm text-brick-600">
              {sendOtp.error.message}
            </p>
          )}
          {register.isError && register.error.status === 409 && (
            <p role="alert" className="mb-3 text-center text-sm text-brick-600">
              Already registered?{" "}
              <a href="/app" className="font-semibold underline">
                Sign in
              </a>
            </p>
          )}
          <Button type="submit" form={FORM_ID} size="lg" fullWidth disabled={busy}>
            {nextLabel}
          </Button>
        </>
      }
    >
      {step === 1 && (
        <CategoryStep
          id={FORM_ID}
          value={draft.category}
          onChange={(category) => setDraft((d) => ({ ...d, category }))}
          onSubmit={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <AboutStep
          id={FORM_ID}
          defaults={draft}
          serverErrors={phoneError ? { phone_national: phoneError } : undefined}
          onSubmit={(v) => {
            setDraft((d) => ({ ...d, ...v }));
            setStep(3);
          }}
        />
      )}
      {step === 3 && (
        <AttendanceStep
          id={FORM_ID}
          defaults={draft}
          capacity={capacity.data?.data.onsite}
          capacityFailed={capacity.isError}
          onSubmit={(v) => {
            setDraft((d) => ({ ...d, ...v }));
            sendOtp.mutate();
          }}
        />
      )}
      {step === 4 && (
        <OtpStep
          id={FORM_ID}
          phone={phone}
          resendAfter={resendAfter}
          error={otpError}
          onSubmit={onSubmitOtp}
          onResend={async () => {
            await requestOtp(phone);
          }}
        />
      )}
    </Frame>
  );
}
