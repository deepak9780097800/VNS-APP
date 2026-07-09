import type { SellerTier, VipNumber } from './types';

/** Parse a decimal price string. "3820.00" -> 3820, "3,820.50" -> 3820.5. */
export function parsePrice(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Render a number as INR, e.g. 3820 -> "₹3,820". */
export function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

/** Normalize the lowercase-ish seller_type to a known tier. */
export function sellerTier(n: Pick<VipNumber, 'seller_type'>): SellerTier {
  return (n.seller_type ?? '').toLowerCase() === 'premium' ? 'premium' : 'basic';
}

/** A real discount exists only when compare_at_price > unit_price. */
export function hasDiscount(n: Pick<VipNumber, 'compare_at_price' | 'unit_price'>): boolean {
  return parsePrice(n.compare_at_price) > parsePrice(n.unit_price);
}

/** Discount percentage off the base unit price (0 when no real discount). */
export function discountPercent(
  n: Pick<VipNumber, 'compare_at_price' | 'unit_price'>,
): number {
  const compare = parsePrice(n.compare_at_price);
  const unit = parsePrice(n.unit_price);
  if (compare <= unit) return 0;
  return Math.round(((compare - unit) / compare) * 100);
}

/**
 * Human pattern labels for a number. The backend keeps pattern info in
 * `category` / `sub_category` (|##|-separated, sometimes with ** markers),
 * falling back to `speciality`. Returns unique, cleaned labels.
 */
export function patternTags(
  n: Pick<VipNumber, 'category' | 'sub_category' | 'speciality'>,
): string[] {
  const raw = [n.category, n.sub_category].filter(Boolean).join(' |##| ');
  const source = raw.trim() || n.speciality || '';
  const labels = source
    .split('|##|')
    .map((s) => s.replace(/\*+/g, '').trim())
    .filter((s) => s.length > 0);
  return Array.from(new Set(labels)).slice(0, 4);
}
