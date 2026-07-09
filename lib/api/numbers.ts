import { apiFetch } from './client';
import { USE_MOCKS } from './config';
import { parsePrice } from './format';
import type {
  Category,
  CategoryListParams,
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
 * GET /web/categories/search — numbers within a category (offset pagination).
 * totalPages = ceil(count / paginate).
 */
export async function getNumbersByCategory({
  category,
  id,
  page = 1,
  paginate = 60,
}: CategoryListParams): Promise<ListResponse<VipNumber>> {
  if (USE_MOCKS) return mockPage(page, paginate);
  const qs = new URLSearchParams({
    category,
    id: String(id),
    page: String(page),
    paginate: String(paginate),
    comingsoon: 'yes',
    star_status: 'true',
  });
  return apiFetch<ListResponse<VipNumber>>(`/web/categories/search?${qs}`, {
    skipAuth: true,
  });
}

/**
 * Tiered search fanout across all price tiers. Returns the merged first page,
 * deduped by productid with tier order preserved. (Per-tier nextURL-based
 * infinite scroll is a fast-follow.)
 */
export async function searchNumbers(
  params: SearchNumbersParams = {},
): Promise<VipNumber[]> {
  if (USE_MOCKS) return filterMock(params);

  const qs = buildSearchQuery(params);
  const tiers = await Promise.all(
    SEARCH_ENDPOINTS.map((ep) =>
      apiFetch<ListResponse<VipNumber>>(`${ep}?${qs}`, { skipAuth: true })
        .then((r) => r.data ?? [])
        .catch(() => [] as VipNumber[]),
    ),
  );

  const seen = new Set<string>();
  const merged: VipNumber[] = [];
  for (const list of tiers) {
    for (const n of list) {
      const key = String(n.productid ?? n.number);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(n);
    }
  }
  return merged;
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

const MOCK_NUMBERS: VipNumber[] = [
  {
    productid: '1',
    productname: '98765 43210',
    number: '9876543210',
    unit_price: '24,999',
    compare_at_price: '39,999',
    seller_type: 'PREMIUM',
    rating: 5,
    cod: 'cod',
    total: 45,
    sum: 9,
    speciality: 'Sequential, Descending',
    star_status: 'Sponsored',
    comingsoon: 'no',
    coming_soon: '',
    comingsoon_date: '',
    discount_expiry: '',
    card_btn_text: 'Buy Now',
  },
  {
    productid: '2',
    productname: '99999 78600',
    number: '9999978600',
    unit_price: '15,999',
    compare_at_price: '21,999',
    seller_type: 'PREMIUM',
    rating: 4,
    cod: 'cod',
    total: 66,
    sum: 3,
    speciality: 'Repeating, 786',
    star_status: '',
    comingsoon: 'no',
    coming_soon: '',
    comingsoon_date: '',
    discount_expiry: '',
    card_btn_text: 'Buy Now',
  },
  {
    productid: '3',
    productname: '90000 90000',
    number: '9000090000',
    unit_price: '49,999',
    compare_at_price: '74,999',
    seller_type: 'PREMIUM',
    rating: 5,
    cod: 'cod',
    total: 18,
    sum: 9,
    speciality: 'Mirror, Repeating',
    star_status: '',
    comingsoon: 'yes',
    coming_soon: 'Coming Soon',
    comingsoon_date: '2026-08-01',
    discount_expiry: '',
    card_btn_text: 'Pre-Book',
  },
  {
    productid: '4',
    productname: '88888 12345',
    number: '8888812345',
    unit_price: '32,999',
    compare_at_price: '45,999',
    seller_type: 'PREMIUM',
    rating: 4,
    cod: 'cod',
    total: 56,
    sum: 2,
    speciality: 'Repeating, Sequential',
    star_status: '',
    comingsoon: 'no',
    coming_soon: '',
    comingsoon_date: '',
    discount_expiry: '',
    card_btn_text: 'Buy Now',
  },
  {
    productid: '5',
    productname: '70007 00700',
    number: '7000700700',
    unit_price: '12,999',
    compare_at_price: '17,999',
    seller_type: 'BASIC',
    rating: 3,
    cod: 'cod',
    total: 28,
    sum: 1,
    speciality: 'Mirror',
    star_status: '',
    comingsoon: 'no',
    coming_soon: '',
    comingsoon_date: '',
    discount_expiry: '',
    card_btn_text: 'Buy Now',
  },
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
    if (params.seller && !params.seller.split(',').includes(n.seller_type)) return false;
    const price = parsePrice(n.unit_price);
    if (params.min_price != null && price < params.min_price) return false;
    if (params.max_price != null && price > params.max_price) return false;
    return true;
  });
}

function mockPage(page: number, paginate: number): ListResponse<VipNumber> {
  const start = (page - 1) * paginate;
  return {
    data: MOCK_NUMBERS.slice(start, start + paginate),
    count: MOCK_NUMBERS.length,
    nextURL: null,
  };
}
