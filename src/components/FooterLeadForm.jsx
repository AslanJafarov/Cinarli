"use client";

import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import {
  formatLocalPhone,
  isValidLocalPhone,
  normalizePhoneDigits,
  toInternationalPhone,
} from "../lib/phone";

export default function FooterLeadForm({
  title,
  phoneLabel,
  submitLabel,
  successMessage,
  messages,
  locale,
}) {
  const id = useId();
  const pathname = usePathname();
  const [digits, setDigits] = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "sending" | "success"
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === "sending") return;

    if (!isValidLocalPhone(digits)) {
      setError(messages.invalidPhone);
      return;
    }

    const website = new FormData(event.currentTarget).get("website");
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: toInternationalPhone(digits),
          source: "footer",
          page: pathname,
          locale,
          website,
        }),
      });
      if (!response.ok) {
        setStatus("idle");
        setError(response.status === 422 ? messages.invalidPhone : messages.failed);
        return;
      }
      setDigits("");
      setStatus("success");
    } catch {
      setStatus("idle");
      setError(messages.failed);
    }
  }

  return (
    <div>
      <h2 className="text-[clamp(17px,1.4vw,28px)] leading-tight">{title}</h2>

      <div className="mt-[clamp(14px,1.55vw,30px)] rounded-[clamp(18px,2vw,40px)] bg-white p-[clamp(18px,1.85vw,36px)]">
        {status === "success" ? (
          <div
            role="status"
            className="flex min-h-[clamp(120px,10vw,200px)] flex-col items-start justify-center gap-3"
          >
            <p className="text-[clamp(15px,1.2vw,23px)] font-semibold">
              {successMessage}
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="cursor-pointer text-[clamp(13px,0.95vw,18px)] font-semibold text-[#24573f] underline underline-offset-4"
            >
              {messages.sendAnother}
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit}>
            <label
              htmlFor={`${id}-phone`}
              className="block text-[clamp(11px,0.9vw,17px)] text-[#6c6b65]"
            >
              {phoneLabel}
            </label>
            <div className="relative mt-[clamp(8px,0.9vw,18px)]">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[clamp(16px,1.5vw,30px)] top-1/2 -translate-y-1/2 text-[clamp(14px,1.2vw,23px)] text-[#6c6b65]"
              >
                +994
              </span>
              <input
                id={`${id}-phone`}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="__ ___ __ __"
                value={formatLocalPhone(digits)}
                onChange={(event) => {
                  setDigits(normalizePhoneDigits(event.target.value));
                  if (error) setError(null);
                }}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className="h-[clamp(46px,3.5vw,70px)] w-full rounded-[clamp(12px,1.4vw,28px)] bg-[#f6f4ef] pl-[clamp(62px,5.2vw,104px)] pr-[clamp(16px,1.5vw,30px)] text-[clamp(14px,1.2vw,23px)] text-[#16201b] outline-none transition placeholder:text-[#9a9991] focus:ring-2 focus:ring-[#24573f]/30 aria-invalid:ring-2 aria-invalid:ring-[#9b2f22]/40"
              />
            </div>

            {/* Honeypot: hidden from visitors, bots tend to fill it in */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            {error && (
              <p
                id={`${id}-error`}
                role="alert"
                className="mt-2 text-[clamp(12px,0.9vw,17px)] text-[#9b2f22]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-[clamp(14px,1.35vw,26px)] h-[clamp(46px,3.4vw,68px)] w-full cursor-pointer rounded-full bg-[#24573f] px-6 text-[clamp(12px,1vw,19px)] uppercase tracking-[0.03em] text-white transition-colors hover:bg-[#1d4833] disabled:cursor-wait disabled:opacity-60 sm:w-[38%]"
            >
              {status === "sending" ? messages.sending : submitLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
