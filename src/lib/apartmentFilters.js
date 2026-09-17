// Apartment filters in the URL: /menziller?rooms=3&area=90-115. Only filters that aren't "all"
// are written, and unknown values are ignored, so old or hand-edited links still open.
// Used by the apartments page and the home page's quick search.

export function defaultFilterValues(filters) {
  return Object.fromEntries(filters.map((filter) => [filter.field, filter.defaultValue]));
}

// A link without any filter opens with the default values.
export function filterValuesFromQuery(filters, search) {
  const params = new URLSearchParams(search);
  if (!filters.some((filter) => params.has(filter.field))) return defaultFilterValues(filters);
  return Object.fromEntries(
    filters.map((filter) => {
      const value = params.get(filter.field);
      const known = filter.options.some((option) => option.value === value);
      return [filter.field, known ? value : "all"];
    }),
  );
}

// "?rooms=3&area=90-115", or "" when every filter is "all".
export function filterQuery(filters, values) {
  const params = new URLSearchParams();
  for (const filter of filters) {
    const value = values[filter.field];
    if (value && value !== "all") params.set(filter.field, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
