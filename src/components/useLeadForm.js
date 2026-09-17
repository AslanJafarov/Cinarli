"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { leadContext } from "../lib/leadContext";
import { isValidLocalPhone, normalizePhoneDigits, toInternationalPhone } from "../lib/phone";

/**
 * Phone input state and sending for the lead forms (POST /api/leads).
 * `source`: which form ("footer", "apartment"); `apartmentId` when the form is about one flat.
 */
export function useLeadForm({ source, apartmentId = null, locale, messages }) {
  const pathname = usePathname();
  const [digits, setDigits] = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "sending" | "success"
  const [error, setError] = useState(null);

  // Remembers the first page and campaign of this visitor as soon as a form is on screen.
  useEffect(() => {
    leadContext();
  }, []);

  const changeDigits = (value) => {
    setDigits(normalizePhoneDigits(value));
    if (error) setError(null);
  };

  async function submit(event) {
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
      const { utm, landingPage } = leadContext();
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: toInternationalPhone(digits),
          source,
          apartmentId,
          page: pathname,
          locale,
          utm,
          landingPage,
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

  return { digits, changeDigits, status, setStatus, error, submit };
}
