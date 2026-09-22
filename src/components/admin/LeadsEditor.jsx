"use client";

import { useEffect, useState, useTransition } from "react";
import { fetchLeads, markLead, removeLead } from "@/app/admin/actions";
import { buttonClass, Icon, IconButton } from "./ui";
import { csvCell } from "../../lib/csv";

const SOURCES = { footer: "Footer forması", apartment: "Mənzil səhifəsi", appointment: "Görüş sorğusu", calculator: "Kalkulyator" };
const LANGUAGES = { az: "AZ", ru: "RU", en: "EN" };

const formatPhone = (phone) =>
  phone.replace(/^\+994(\d{2})(\d{3})(\d{2})(\d{2})$/, "+994 $1 $2 $3 $4");

const formatDate = (iso) =>
  new Date(iso).toLocaleString("az-AZ", { dateStyle: "short", timeStyle: "short" });

const campaign = (utm = {}) =>
  [utm.utm_source, utm.utm_medium, utm.utm_campaign].filter(Boolean).join(" / ");

function exportCsv(leads) {
  const rows = [
    ["Tarix", "Telefon", "Status", "Forma", "Mənzil", "Səhifə", "Dil", "Kampaniya", "İlk səhifə"],
    ...leads.map((lead) => [
      formatDate(lead.createdAt),
      lead.phone,
      lead.status === "done" ? "Baxıldı" : "Yeni",
      SOURCES[lead.source] ?? lead.source,
      lead.apartmentId ?? "",
      lead.page ?? "",
      LANGUAGES[lead.locale] ?? lead.locale,
      campaign(lead.utm),
      lead.landingPage ?? "",
    ]),
  ];
  const csv = rows
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
  // The BOM makes Excel read the Azerbaijani letters correctly.
  const url = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `cinarli-muracietler-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Leads from the website forms. Status changes and deletions are saved right away. */
export default function LeadsEditor({ leads, onChange, onError }) {
  const [filter, setFilter] = useState("new");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [refreshing, startRefresh] = useTransition();

  const refresh = () =>
    startRefresh(async () => {
      try {
        onChange(await fetchLeads());
      } catch {
        onError("Müraciətlər yenilənmədi.");
      }
    });

  // New leads show up without reloading the page.
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        onChange(await fetchLeads());
      } catch {
        // Next attempt in a minute.
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [onChange]);

  const run = async (action) => {
    try {
      onChange(await action());
    } catch {
      onError("Dəyişiklik yadda saxlanmadı. Yenidən cəhd edin.");
    }
  };

  const newCount = leads.filter((lead) => lead.status !== "done").length;
  const visible = filter === "new" ? leads.filter((lead) => lead.status !== "done") : leads;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(22,32,27,0.06)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtr" className="flex rounded-full bg-[#16201b]/6 p-1">
          {[
            ["new", `Yeni (${newCount})`],
            ["all", `Hamısı (${leads.length})`],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                filter === value ? "bg-white text-[#16201b] shadow-sm" : "text-[#6b6a63]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={refresh} disabled={refreshing} className={buttonClass.secondary}>
            {refreshing ? "Yenilənir…" : "Yenilə"}
          </button>
          <button
            type="button"
            onClick={() => exportCsv(leads)}
            disabled={leads.length === 0}
            className={buttonClass.secondary}
          >
            <Icon name="download" /> Excel (CSV)
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-14 text-center text-sm text-[#77766f]">
          {filter === "new" && leads.length > 0
            ? "Yeni müraciət yoxdur."
            : "Hələ müraciət yoxdur. Saytdakı formalardan göndərilən nömrələr burada görünəcək."}
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-[#16201b]/8">
          {visible.map((lead) => {
            const done = lead.status === "done";
            return (
              <li
                key={lead.id}
                className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {!done && <span className="size-2 rounded-full bg-[#d19a1a]" aria-label="Yeni" />}
                    <a
                      href={`tel:${lead.phone}`}
                      className={`inline-flex items-center gap-1.5 text-lg font-bold tabular-nums hover:underline ${
                        done ? "text-[#6b6a63]" : "text-[#16201b]"
                      }`}
                    >
                      <Icon name="phone" /> {formatPhone(lead.phone)}
                    </a>
                    <span className="text-sm text-[#77766f]">{formatDate(lead.createdAt)}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded-full bg-[#16201b]/6 px-2 py-0.5 font-semibold">
                      {SOURCES[lead.source] ?? lead.source}
                    </span>
                    {lead.apartmentId && (
                      <a
                        href={`/menziller/${encodeURIComponent(lead.apartmentId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-[#c8d9cd] px-2 py-0.5 font-semibold text-[#1c3b2b] hover:underline"
                      >
                        Mənzil {lead.apartmentId}
                      </a>
                    )}
                    <span className="rounded-full bg-[#16201b]/6 px-2 py-0.5">
                      {LANGUAGES[lead.locale] ?? lead.locale}
                    </span>
                    {campaign(lead.utm) && (
                      <span className="rounded-full bg-[#fbf5df] px-2 py-0.5 text-[#8a6a12]">
                        Kampaniya: {campaign(lead.utm)}
                      </span>
                    )}
                    {lead.page && (
                      <span className="truncate px-1 py-0.5 text-[#9a9991]">Səhifə: {lead.page}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => run(() => markLead(lead.id, done ? "new" : "done"))}
                    className={done ? buttonClass.ghost : buttonClass.secondary}
                  >
                    {done ? (
                      "Yeni kimi işarələ"
                    ) : (
                      <>
                        <Icon name="check" /> Baxıldı
                      </>
                    )}
                  </button>
                  {confirmDelete === lead.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDelete(null);
                          run(() => removeLead(lead.id));
                        }}
                        className={buttonClass.danger}
                      >
                        Sil
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className={buttonClass.ghost}
                      >
                        Geri
                      </button>
                    </>
                  ) : (
                    <IconButton
                      label="Müraciəti sil"
                      icon="trash"
                      danger
                      onClick={() => setConfirmDelete(lead.id)}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
