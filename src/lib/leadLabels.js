// Labels for lead fields, shared by the admin panel (LeadsEditor.jsx) and the Google Sheets copy
// (leadSheet.js), so both show the same words.
export const SOURCES = {
  footer: "Footer forması",
  apartment: "Mənzil səhifəsi",
  appointment: "Görüş sorğusu",
  calculator: "Kalkulyator",
};

export const LANGUAGES = { az: "AZ", ru: "RU", en: "EN" };

// "+994501234567" -> "+994 50 123 45 67"; anything else is returned as it is.
export const formatPhone = (phone) =>
  String(phone ?? "").replace(/^\+994(\d{2})(\d{3})(\d{2})(\d{2})$/, "+994 $1 $2 $3 $4");
