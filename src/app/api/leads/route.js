import { isValidInternationalPhone } from "@/lib/phone";

// Receives "call me back" requests from the lead forms.
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

  const lead = {
    phone,
    source: String(body.source ?? "website").slice(0, 40),
    page: String(body.page ?? "").slice(0, 200),
    locale: String(body.locale ?? "az").slice(0, 5),
    createdAt: new Date().toISOString(),
  };

  // TODO: forward to the sales team (CRM, e-mail or Telegram). Until then leads only reach the server log.
  console.info("[lead]", JSON.stringify(lead));

  return Response.json({ ok: true }, { status: 201 });
}
