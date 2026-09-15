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
