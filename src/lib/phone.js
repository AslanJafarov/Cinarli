// Azerbaijani mobile operator and Baku landline prefixes accepted by the lead forms.
const OPERATOR_CODES = ["10", "12", "50", "51", "55", "60", "70", "77", "99"];

// Returns the 9 national digits from whatever was typed or pasted:
// drops a leading trunk "0" (050…) and a pasted country code (+994…).
export function normalizePhoneDigits(input) {
  let digits = String(input ?? "").replace(/\D/g, "");
  if (digits.length > 9 && digits.startsWith("994")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 9);
}

// "501234567" -> "50 123 45 67"
export function formatLocalPhone(digits) {
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)]
    .filter(Boolean)
    .join(" ");
}

export function isValidLocalPhone(digits) {
  return /^\d{9}$/.test(digits) && OPERATOR_CODES.includes(digits.slice(0, 2));
}

export const toInternationalPhone = (digits) => `+994${digits}`;

export function isValidInternationalPhone(phone) {
  return (
    typeof phone === "string" &&
    phone.startsWith("+994") &&
    isValidLocalPhone(phone.slice(4))
  );
}
