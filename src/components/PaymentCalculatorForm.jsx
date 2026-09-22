"use client";

import { translate } from "../i18n/format";
import { useState } from "react";
import { calculatePayment } from "../lib/calculator";
import CallbackLink from "./CallbackLink";

// "185000" -> "185 000"
const formatNumber = (value) =>
  Math.round(value).toLocaleString("en-US").replace(/,/g, " ");

export default function PaymentCalculatorForm({ locale, settings, ui }) {
  const {
    title,
    subtitle,
    formTitle,
    planTitle,
    currency,
  } = settings;
  const [values, setValues] = useState({ price: String(settings.price), downPayment: String(settings.downPayment), months: String(settings.months) });
  const { price, downPayment, months } = values;
  const t = ui.payment;

  const result = calculatePayment(price, downPayment, months);
  const valid = result !== null;
  const errors = {
    price: price === "" || !Number.isFinite(Number(price)) || Number(price) <= 0,
    downPayment: downPayment === "" || !Number.isFinite(Number(downPayment)) || Number(downPayment) < 0 || Number(downPayment) > Number(price),
    months: months === "" || !Number.isInteger(Number(months)) || Number(months) <= 0,
  };
  const termText = translate(ui.common.months, { count: months }, locale);

  // Only the number is editable; the unit is a fixed suffix inside the field.
  const fields = [
    { id: "calc-price", name: "price", label: t.price, value: price, unit: currency, step: 1000 },
    { id: "calc-down", name: "downPayment", label: t.downPayment, value: downPayment, unit: currency, step: 1000 },
    { id: "calc-months", name: "months", label: t.term, value: months, unit: t.monthsUnit, step: 1 },
  ];

  const planRows = [
    [t.downPayment, valid ? `${result.percent}%` : "\u2014"],
    [t.remaining, valid ? `${formatNumber(result.remaining)} ${currency}` : "\u2014"],
    [t.term, valid ? termText : "\u2014"],
  ];

  return (
    <section
      id="odenis"
      data-admin-preview="paymentCalculator"
      className="w-full scroll-mt-(--nav-h) bg-[#f6f4ef] px-page pb-[clamp(56px,6vw,120px)] pt-[clamp(40px,3.6vw,72px)] text-[#16201b]"
    >
      <h2 className="text-[clamp(34px,3.95vw,76px)] leading-[1.1]">{title}</h2>
      <p className="mt-[clamp(8px,0.8vw,16px)] text-[clamp(14px,1.2vw,23px)] text-[#6c6b65]">
        {subtitle}
      </p>

      <div className="mt-[clamp(28px,3.6vw,70px)] grid items-stretch gap-[clamp(20px,3.7vw,72px)] lg:grid-cols-[1075fr_693fr]">
        {/* Recalculate the existing estimate from the current inputs. */}
        <form noValidate onSubmit={(event) => {
          event.preventDefault();
          if (!valid) event.currentTarget.querySelector('[aria-invalid="true"]')?.focus();
          else document.getElementById("calc-result")?.focus();
        }} className="rounded-[clamp(20px,2.25vw,44px)] bg-white pb-[clamp(22px,2.15vw,42px)] pl-[clamp(20px,2.35vw,46px)] pr-[clamp(20px,3.45vw,68px)] pt-[clamp(22px,2.3vw,46px)]">
          <h3 className="text-[clamp(20px,1.8vw,36px)] leading-tight">
            {formTitle}
          </h3>

          <div className="mt-[clamp(18px,2.2vw,44px)] space-y-[clamp(12px,1.25vw,24px)]">
            {fields.map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-[clamp(11px,0.9vw,18px)] text-[#6c6b65]"
                >
                  {field.label}
                </label>
                <div className="relative mt-[clamp(6px,0.65vw,12px)]">
                  <input
                    id={field.id}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={field.step}
                    value={field.value}
                    onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                    aria-invalid={errors[field.name] || undefined}
                    aria-describedby={errors[field.name] ? "calc-error" : undefined}
                    className="h-[clamp(46px,4.05vw,80px)] w-full rounded-[clamp(12px,1.1vw,22px)] bg-[#f6f4ef] pl-[clamp(16px,1.75vw,34px)] pr-[clamp(56px,5vw,96px)] text-[clamp(14px,1.2vw,23px)] outline-none [appearance:textfield] focus:ring-2 focus:ring-[#24503a]/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-[clamp(16px,1.75vw,34px)] top-1/2 -translate-y-1/2 text-[clamp(14px,1.2vw,23px)] text-[#6c6b65]"
                  >
                    {field.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!valid && <p id="calc-error" role="alert" className="mt-4 text-sm text-[#9b2f22]">{t.invalid}</p>}
          <button
            type="submit"
            className="mt-[clamp(20px,2vw,40px)] h-[clamp(46px,3.85vw,76px)] w-full cursor-pointer rounded-full bg-[#13271f] text-[clamp(12px,1vw,19px)] uppercase tracking-[0.02em] text-white sm:w-[38%]"
          >
            {t.calculate}
          </button>
        </form>

        {/* Sample plan */}
        <aside id="calc-result" tabIndex={-1} aria-live="polite" className="flex flex-col rounded-[clamp(20px,2.25vw,44px)] bg-[#13271f] px-[clamp(20px,2.85vw,56px)] pb-[clamp(20px,1.85vw,36px)] pt-[clamp(24px,3vw,58px)] text-white">
          <p className="text-[clamp(13px,1.1vw,21px)] text-white/80">
            {planTitle}
          </p>
          <p className="mt-[clamp(16px,2vw,40px)] whitespace-nowrap text-[clamp(34px,3.5vw,68px)] leading-none">
            {valid ? formatNumber(result.monthly) : "\u2014"} {currency}
          </p>
          <p className="mt-[clamp(6px,0.7vw,14px)] text-[clamp(13px,1.1vw,21px)] text-white/85">
            {t.monthly}
          </p>

          <dl className="mt-[clamp(18px,2.3vw,44px)]">
            {planRows.map(([label, value]) => (
              <div
                key={label}
                className="flex h-[clamp(46px,4.4vw,86px)] items-center justify-between gap-4 border-b border-white/15"
              >
                <dt className="text-[clamp(11px,0.9vw,18px)] text-white/75">
                  {label}
                </dt>
                <dd className="text-[clamp(13px,1vw,20px)]">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Pinned to the bottom when the card is taller than its content */}
          <div className="mt-auto pt-[clamp(20px,1.6vw,32px)]">
            <CallbackLink
              source="calculator"
              className="flex items-center justify-center h-[clamp(46px,3.8vw,74px)] w-full cursor-pointer rounded-full bg-[#ebe3c6] text-[clamp(12px,0.95vw,18px)] uppercase tracking-[0.02em] text-[#16201b]"
            >
              {t.talkToManager}
            </CallbackLink>
          </div>
        </aside>
      </div>
    </section>
  );
}
