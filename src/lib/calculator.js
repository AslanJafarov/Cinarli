export function calculatePayment(price, downPayment, months) {
  const values = [price, downPayment, months];
  if (values.some((value) => value === "" || value === null || !Number.isFinite(Number(value)))) return null;
  const [total, down, term] = values.map(Number);
  if (total <= 0 || down < 0 || down > total || !Number.isInteger(term) || term <= 0) return null;
  const remaining = total - down;
  return { remaining, monthly: remaining / term, percent: Math.round(down / total * 100), months: term };
}
