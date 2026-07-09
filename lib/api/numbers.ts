import { apiFetch } from './client';
import { USE_MOCKS } from './config';
import { sellerTier } from './format';
import type {
  Category,
  ListResponse,
  SearchNumbersParams,
  VipNumber,
} from './types';

/**
 * Search tiers, in display priority order. The site fans out to all of these
 * in parallel so premium/high-value numbers aren't missed; we merge + dedupe.
 */
const SEARCH_ENDPOINTS = [
  '/web/platinum/search',
  '/web/gold/search',
  '/web/silver/search',
  '/web/bronze/search',
  '/web/global/basic/search',
];

function buildSearchQuery(p: SearchNumbersParams): string {
  const qs = new URLSearchParams();
  qs.append('seller', p.seller ?? 'BASIC,PREMIUM');
  qs.append('star_status', 'true');
  qs.append('paginate', '60');
  if (p.number) qs.append('number', p.number);
  if (p.start_with) qs.append('start_with', p.start_with);
  if (p.end_with) qs.append('end_with', p.end_with);
  if (p.any_where) qs.append('any_where', p.any_where);
  if (p.min_price != null) qs.append('min_price', String(p.min_price));
  if (p.max_price != null) qs.append('max_price', String(p.max_price));
  if (p.sort) qs.append('sort', p.sort);
  return qs.toString();
}

/** GET /web/categories — server-driven taxonomy (filter chips come from this). */
export async function getCategories(): Promise<Category[]> {
  if (USE_MOCKS) return MOCK_CATEGORIES;
  const resp = await apiFetch<{ data: Category[] }>('/web/categories', {
    skipAuth: true,
  });
  return resp.data ?? [];
}

/**
 * GET /web/categories/search — one cursor page of a category's numbers.
 * Pass `url` (a response's nextURL) to advance; omit for the first page.
 */
export async function getCategoryPage(args: {
  category: string;
  id: string | number;
  paginate?: number;
  url?: string | null;
}): Promise<ListResponse<VipNumber>> {
  if (USE_MOCKS) return mockPage(args.url);
  const url =
    args.url ??
    `/web/categories/search?${new URLSearchParams({
      category: args.category,
      id: String(args.id),
      paginate: String(args.paginate ?? 60),
      comingsoon: 'yes',
      star_status: 'true',
    })}`;
  return apiFetch<ListResponse<VipNumber>>(url, { skipAuth: true });
}

/** One cursor page across all search tiers, merged + deduped by productid. */
export interface SearchPage {
  data: VipNumber[];
  /** Per-tier nextURL (null when that tier is exhausted). */
  nextURLs: (string | null)[];
}

export async function searchNumbersPage(
  params: SearchNumbersParams,
  cursors?: (string | null)[],
): Promise<SearchPage> {
  if (USE_MOCKS) {
    return { data: filterMock(params), nextURLs: SEARCH_ENDPOINTS.map(() => null) };
  }

  const qs = buildSearchQuery(params);
  const urls = cursors ?? SEARCH_ENDPOINTS.map((ep) => `${ep}?${qs}`);

  const responses = await Promise.all(
    urls.map((u) =>
      u
        ? apiFetch<ListResponse<VipNumber>>(u, { skipAuth: true }).catch(() => null)
        : Promise.resolve(null),
    ),
  );

  const seen = new Set<string>();
  const data: VipNumber[] = [];
  const nextURLs: (string | null)[] = [];
  responses.forEach((r) => {
    nextURLs.push(r?.nextURL ?? null);
    (r?.data ?? []).forEach((n) => {
      const key = String(n.productid ?? n.number);
      if (seen.has(key)) return;
      seen.add(key);
      data.push(n);
    });
  });
  return { data, nextURLs };
}

/** Convenience: merged first page of a tiered search (used by Home). */
export async function searchNumbers(
  params: SearchNumbersParams = {},
): Promise<VipNumber[]> {
  const page = await searchNumbersPage(params);
  return page.data;
}

/** GET /web/product?productid=<id> (or ?number=<digits> for 10-digit input). */
export async function getNumber(idOrNumber: string | number): Promise<VipNumber> {
  const val = String(idOrNumber);
  if (USE_MOCKS) {
    const compact = val.replace(/\s/g, '');
    const found = MOCK_NUMBERS.find(
      (n) => String(n.productid) === val || n.number.replace(/\s/g, '') === compact,
    );
    if (!found) throw new Error(`Number ${val} not found`);
    return found;
  }
  const digits = val.replace(/\D/g, '');
  const param =
    digits.length === 10
      ? `number=${encodeURIComponent(digits)}`
      : `productid=${encodeURIComponent(val)}`;
  const resp = await apiFetch<{ data: VipNumber }>(`/web/product?${param}`, {
    skipAuth: true,
  });
  return resp.data;
}

// ---------------------------------------------------------------------------
// Mocks (USE_MOCKS) — shaped like the real backend so the UI renders offline.
// ---------------------------------------------------------------------------

function mockNumber(over: Partial<VipNumber> & Pick<VipNumber, 'productid' | 'number'>): VipNumber {
  return {
    productname: over.number,
    seller_type: 'basic',
    seller_status: 'active',
    product_status: 'active',
    star_status: 'Normal',
    unit_price: '3820.00',
    price_with_gst: '4797.00',
    gst_price: '977.00',
    compare_at_price: '3820.00',
    discount_expiry: null,
    total: 0,
    sum: 0,
    rtp: 'no',
    comingsoon: 'YES',
    comingsoon_date: null,
    rtp_date: null,
    category: '',
    sub_category: '',
    speciality: '',
    created_at: '2026-01-01 00:00:00',
    updated_at: '2026-01-01 00:00:00',
    ...over,
  };
}

const MOCK_NUMBERS: VipNumber[] = [
  mockNumber({
    productid: 1, number: '9876543210', unit_price: '24999.00', price_with_gst: '29498.82',
    gst_price: '4499.82', compare_at_price: '39999.00', seller_type: 'premium', star_status: 'Sponsored',
    total: 45, sum: 9, category: 'Sequential Numbers', sub_category: 'Descending |##| 10-9-8-7',
  }),
  mockNumber({
    productid: 2, number: '9999978600', unit_price: '15999.00', price_with_gst: '18878.82',
    gst_price: '2879.82', compare_at_price: '15999.00', seller_type: 'premium',
    total: 66, sum: 3, category: 'Repeating Numbers', sub_category: '786 |##| Triple 9',
  }),
  mockNumber({
    productid: 3, number: '9000090000', unit_price: '49999.00', price_with_gst: '58998.82',
    gst_price: '8999.82', compare_at_price: '74999.00', seller_type: 'premium',
    total: 18, sum: 9, category: 'Mirror Numbers', sub_category: 'Doublling (AABBCC) |##| **XYXY**',
  }),
  mockNumber({
    productid: 4, number: '8888812345', unit_price: '32999.00', price_with_gst: '38938.82',
    gst_price: '5939.82', compare_at_price: '32999.00', seller_type: 'premium',
    total: 56, sum: 2, category: 'Penta Number', sub_category: 'AAAAA |##| Sequential',
  }),
  mockNumber({
    productid: 5, number: '7000700700', unit_price: '3820.00', price_with_gst: '4797.00',
    gst_price: '977.00', compare_at_price: '3820.00', seller_type: 'basic',
    total: 28, sum: 1, category: 'xyxy (2 times)', sub_category: 'ABAB-XYXY',
  }),
];

const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Sequential Numbers', detail: { slug: 'sequential-numbers', h1_tag: 'Sequential Numbers', sub_heading: 'Numbers in running order' }, sub_categories: [] },
  { id: 'c2', name: 'Mirror Numbers', detail: { slug: 'mirror-numbers', h1_tag: 'Mirror Numbers', sub_heading: 'Palindrome-style numbers' }, sub_categories: [] },
  { id: 'c3', name: 'Repeating Numbers', detail: { slug: 'repeating-numbers', h1_tag: 'Repeating Numbers', sub_heading: 'Numbers with repeating digits' }, sub_categories: [] },
  { id: 'c4', name: '786 Numbers', detail: { slug: '786-numbers', h1_tag: '786 Numbers', sub_heading: 'Auspicious 786 numbers' }, sub_categories: [] },
  { id: 'c5', name: 'Penta Number', detail: { slug: 'penta-number', h1_tag: 'Penta Numbers', sub_heading: 'Five-of-a-kind numbers' }, sub_categories: [] },
];

function filterMock(params: SearchNumbersParams): VipNumber[] {
  return MOCK_NUMBERS.filter((n) => {
    const compact = n.number.replace(/\s/g, '');
    if (params.number && !compact.includes(params.number.replace(/\s/g, ''))) return false;
    if (params.start_with && !compact.startsWith(params.start_with)) return false;
    if (params.end_with && !compact.endsWith(params.end_with)) return false;
    if (params.any_where && !compact.includes(params.any_where)) return false;
    if (params.seller) {
      const tiers = params.seller.toLowerCase().split(',');
      if (!tiers.includes(sellerTier(n))) return false;
    }
    const price = parseFloat(n.unit_price);
    if (params.min_price != null && price < params.min_price) return false;
    if (params.max_price != null && price > params.max_price) return false;
    return true;
  });
}

/** Single-page mock (cursor style): first page returns all, no nextURL. */
function mockPage(url?: string | null): ListResponse<VipNumber> {
  return {
    status: 'success',
    message: null,
    data: url ? [] : MOCK_NUMBERS,
    nextURL: null,
    previousURL: null,
    total: MOCK_NUMBERS.length,
  };
}
