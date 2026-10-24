/** Shared by readers, scripts and tests. No browser or filesystem dependencies. */
export function normalizeDate(value: unknown): string {
  if (value instanceof Date)
    return Number.isNaN(value.getTime())
      ? ""
      : value.toISOString().slice(0, 10);
  const match = /^(\d{4}-\d{2}-\d{2})(?:$|T|\s)/.exec(
    String(value ?? "").trim(),
  );
  if (!match) return "";
  const parsed = new Date(`${match[1]}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === match[1]
    ? match[1]
    : "";
}
export function pageNumber(value: unknown, totalPages: number): number {
  const number = Number(value);
  return Math.min(
    Math.max(1, Number.isFinite(number) ? Math.floor(number) : 1),
    Math.max(1, totalPages),
  );
}
export function blogHref(filters: {
  type?: string;
  tag?: string;
  category?: string;
  page?: number;
}): string {
  const query = new URLSearchParams();
  for (const key of ["type", "tag", "category", "page"] as const) {
    const value = filters[key];
    if (value && value !== "all") query.set(key, String(value));
  }
  return `/blog${query.size ? `?${query}` : ""}`;
}
export function compareProjects(
  a: { order: number; date: string },
  b: { order: number; date: string },
): number {
  return a.order - b.order || b.date.localeCompare(a.date);
}
