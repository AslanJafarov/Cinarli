import { addLead } from "@/lib/leads";
import { isValidInternationalPhone } from "@/lib/phone";

const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

// Receives "call me back" requests from the lead forms and saves them for the admin panel.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Sorğu oxunmadı." }, { status: 400 });
  }

  // Honeypot field: real visitors never see it, so a value means a bot.
  if (body?.website) {
    return Response.json({ ok: true }, { status: 201 });
  }

  const phone = typeof body?.phone === "string" ? body.phone.replace(/\s+/g, "") : "";
  if (!isValidInternationalPhone(phone)) {
    return Response.json(
      { error: "Telefon nömrəsi düzgün deyil. Məsələn: 50 123 45 67." },
      { status: 422 },
    );
  }

  const utm = Object.fromEntries(
    UTM_KEYS.map((key) => [key, text(body.utm?.[key], 100)]).filter(([, value]) => value),
  );

  try {
    await addLead({
      phone,
      source: text(body.source, 40) || "website",
      apartmentId: text(body.apartmentId, 40) || null,
      page: text(body.page, 200),
      locale: text(body.locale, 5) || "az",
      utm,
      landingPage: text(body.landingPage, 200),
    });
  } catch (error) {
    console.error("[lead] could not be saved", error);
    return Response.json({ error: "Göndərmək alınmadı." }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
