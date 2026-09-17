/**
 * Fills "{name}" placeholders. A template can also be a set of plural forms
 * ({ one, few, many, other }) picked by `vars.count`; non-numeric counts such as
 * "2-3" use "few" when present (Russian), otherwise "other".
 */
export function translate(template, vars = {}, locale = "az") {
  let text = template;

  if (template && typeof template === "object") {
    const count = Number(vars.count);
    const form = Number.isFinite(count)
      ? new Intl.PluralRules(locale).select(count)
      : "few";
    text = template[form] ?? template.other;
  }

  return String(text ?? "").replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  );
}

// Azerbaijani ordinal suffix: 1-ci, 3-cü, 6-cı, 9-cu, 40-cı, 100-cü …
const unitSuffix = { 1: "ci", 2: "ci", 3: "cü", 4: "cü", 5: "ci", 6: "cı", 7: "ci", 8: "ci", 9: "cu" };
const tensSuffix = { 1: "cu", 2: "ci", 3: "cu", 4: "cı", 5: "ci", 6: "cı", 7: "ci", 8: "ci", 9: "cı" };

export function ordinal(value) {
  const n = Math.abs(Math.trunc(Number(value)));
  if (n % 10) return `${n}-${unitSuffix[n % 10]}`;
  if (n % 100) return `${n}-${tensSuffix[(n % 100) / 10]}`;
  return `${n}-cü`;
}
