"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

const LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
};

export function OtpInput({ value, onChange, onComplete, disabled, invalid, autoFocus }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  useEffect(() => { if (invalid && !value) refs.current[0]?.focus(); }, [invalid, value]);
  const commit = (next: string, focusIndex: number) => {
    const clean = next.replace(/\D/g, "").slice(0, LENGTH);
    onChange(clean);
    refs.current[Math.min(focusIndex, LENGTH - 1)]?.focus();
    if (clean.length === LENGTH) onComplete?.(clean);
  };

  const onInput = (i: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    // Mobile one-time-code autofill can drop the whole code into a single box.
    const merged = (value.slice(0, i) + typed + value.slice(i + typed.length)).slice(0, LENGTH);
    commit(merged, i + typed.length);
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) commit(value.slice(0, i) + value.slice(i + 1), i);
      else if (i > 0) commit(value.slice(0, i - 1) + value.slice(i), i - 1);
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < LENGTH - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    commit(pasted, pasted.length);
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={LENGTH}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          onChange={(e) => onInput(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          className={`h-12 w-full min-w-0 rounded-[6px] border bg-white text-center font-sans text-[20px] font-bold text-[#0a0a0a] outline-none transition focus:ring-2 disabled:opacity-60 ${
            invalid
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
              : d
                ? "border-[#0649b5]/60 focus:border-[#0649b5] focus:ring-[#0649b5]/20"
                : "border-black/12 focus:border-[#0649b5] focus:ring-[#0649b5]/20"
          }`}
        />
      ))}
    </div>
  );
}

/** Resend countdown; mirrors the server's 60s per-code cooldown. */
export function formatCountdown(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export function useResendCooldown(seconds = 60, startActive = false) {
  const [left, setLeft] = useState(startActive ? seconds : 0);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  return { left, start: () => setLeft(seconds) };
}

/** A live OTP expiry display; the server remains authoritative when a code is submitted. */
export function useOtpExpiryCountdown(seconds = 10 * 60) {
  const [left, setLeft] = useState(seconds);
  const expiresAt = useRef<number | null>(null);

  useEffect(() => {
    expiresAt.current = Date.now() + seconds * 1000;
    const tick = () => {
      if (expiresAt.current !== null) {
        setLeft(Math.max(0, Math.ceil((expiresAt.current - Date.now()) / 1000)));
      }
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [seconds]);

  return {
    left,
    expired: left <= 0,
    restart: () => {
      expiresAt.current = Date.now() + seconds * 1000;
      setLeft(seconds);
    },
  };
}
