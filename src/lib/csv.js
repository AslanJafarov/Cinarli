// Quote escaping alone does not stop spreadsheet formula execution: a leading apostrophe makes
// Excel and Google Sheets keep formula-like text as text (the apostrophe itself is not shown).
export function plainText(value) {
  const text = String(value ?? "");
  return /^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
}

export const csvCell = (value) => `"${plainText(value).replaceAll('"', '""')}"`;
