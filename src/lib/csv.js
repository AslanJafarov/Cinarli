// Quote escaping alone does not stop spreadsheet formula execution.
export function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
