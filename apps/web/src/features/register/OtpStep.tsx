"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatPhone } from "@/lib/phone";
import { otpSchema } from "./schema";

type Props = {
  id: string;
  phone: string;
  resendAfter: number;
  error?: string;
  onSubmit: (code: string) => void;
  onResend: () => Promise<void>;
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function OtpStep({ id, phone, resendAfter, error, onSubmit, onResend }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [consent, setConsent] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const [seconds, setSeconds] = useState(resendAfter);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const submit = useCallback(
    (code: string, agreed: boolean) => {
      const parsed = otpSchema.safeParse({ code, consent: agreed });
      if (!parsed.success) return setLocalError(parsed.error.issues[0].message);
      setLocalError(undefined);
      onSubmit(code);
    },
    [onSubmit],
  );

  const fill = useCallback((code: string) => setDigits(code.slice(0, 6).split("").concat(Array(6).fill("")).slice(0, 6)), []);

  // Android auto-read of the SMS (WebOTP). Silently skipped where unsupported.
  useEffect(() => {
    if (!("OTPCredential" in window)) return;
    const ac = new AbortController();
    (navigator.credentials as CredentialsContainer & { get: (o: unknown) => Promise<{ code?: string } | null> })
      .get({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((c) => c?.code && fill(c.code.replace(/\D/g, "")))
      .catch(() => {});
    return () => ac.abort();
  }, [fill]);

  const set = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, "");
    if (v.length > 1) {
      fill(v);
      refs.current[Math.min(v.length, 5)]?.focus();
      if (v.length >= 6 && consent) submit(v.slice(0, 6), consent);
      return;
    }
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
    if (v && i === 5 && consent) submit(next.join(""), consent);
  };

  const message = localError ?? error;

  return (
    <form
      id={id}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit(digits.join(""), consent);
      }}
      className="flex flex-col gap-3.5"
    >
      <p className="text-[15px] leading-[1.45] text-ink-500">Sent to {formatPhone(phone)}</p>
      <div className="mt-1.5 grid grid-cols-6 gap-2 md:max-w-sm" role="group" aria-label="6-digit code">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            maxLength={i === 0 ? 6 : 1}
            autoFocus={i === 0}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
            }}
            className={cn(
              "h-14 min-w-0 rounded-[10px] border bg-white text-center font-display text-[26px] font-semibold text-ink-900 outline-none",
              "focus:border-2 focus:border-cobalt-600",
              message ? "border-brick-600" : "border-ink-100",
            )}
          />
        ))}
      </div>
      {message && (
        <span role="alert" className="text-sm text-brick-600">
          {message}
        </span>
      )}
      {seconds > 0 ? (
        <span className="text-[13px] font-medium text-ink-400">Resend in {fmt(seconds)}</span>
      ) : (
        <button
          type="button"
          onClick={async () => {
            try {
              await onResend();
              setSeconds(60);
            } catch {
              setLocalError("Couldn’t resend the code. Try again.");
            }
          }}
          className="self-start text-[13px] font-semibold text-cobalt-700"
        >
          Resend code
        </button>
      )}
      <Checkbox label="I agree to the privacy notice and to receive conference messages." checked={consent} onChange={setConsent} />
    </form>
  );
}
