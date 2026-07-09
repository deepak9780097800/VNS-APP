/** Formatting helpers for backend price strings. */

/** Strip commas/currency and parse to a number. "24,999" -> 24999. */
export function parsePrice(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Render a number as INR, e.g. 24999 -> "₹24,999". */
export function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

/** Truthy check for the backend's stringy "coming soon" flags. */
export function isComingSoon(item: {
  comingsoon?: string;
  coming_soon?: string;
}): boolean {
  const v = `${item.comingsoon ?? ''}${item.coming_soon ?? ''}`.toLowerCase();
  return v.includes('yes') || v.includes('true') || v.includes('soon');
}
