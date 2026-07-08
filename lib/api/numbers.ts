import { apiFetch } from './client';
import { USE_MOCKS } from './config';
import type { SearchNumbersParams, VipNumber } from './types';

/** Sample stock so the UI renders without a backend (USE_MOCKS). */
const MOCK_NUMBERS: VipNumber[] = [
  {
    id: '1',
    number: '98765 43210',
    price: 24999,
    mrp: 39999,
    operator: 'Airtel',
    category: 'Platinum',
    patternTags: ['Sequential', 'Descending'],
    isFreshStock: true,
  },
  {
    id: '2',
    number: '99999 78600',
    price: 15999,
    mrp: 21999,
    operator: 'Jio',
    category: 'VIP',
    patternTags: ['Repeating', '786'],
    isFreshStock: true,
  },
  {
    id: '3',
    number: '90000 90000',
    price: 49999,
    mrp: 74999,
    operator: 'Vi',
    category: 'Gold',
    patternTags: ['Mirror', 'Repeating'],
    isFreshStock: false,
  },
  {
    id: '4',
    number: '88888 12345',
    price: 32999,
    mrp: 45999,
    operator: 'Airtel',
    category: 'Premium',
    patternTags: ['Repeating', 'Sequential'],
    isFreshStock: true,
  },
  {
    id: '5',
    number: '70007 00700',
    price: 12999,
    mrp: 17999,
    operator: 'BSNL',
    category: 'Fancy',
    patternTags: ['Mirror'],
    isFreshStock: false,
  },
];

function filterMock(params: SearchNumbersParams): VipNumber[] {
  return MOCK_NUMBERS.filter((n) => {
    if (params.query) {
      const q = params.query.replace(/\s+/g, '');
      if (!n.number.replace(/\s+/g, '').includes(q)) return false;
    }
    if (params.operator && n.operator !== params.operator) return false;
    if (params.category && n.category !== params.category) return false;
    if (params.minPrice != null && n.price < params.minPrice) return false;
    if (params.maxPrice != null && n.price > params.maxPrice) return false;
    if (params.patternTag && !n.patternTags.includes(params.patternTag)) return false;
    return true;
  });
}

export async function searchNumbers(
  params: SearchNumbersParams = {},
): Promise<VipNumber[]> {
  if (USE_MOCKS) return filterMock(params);

  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') search.append(k, String(v));
  });
  const qs = search.toString();
  return apiFetch<VipNumber[]>(`/numbers${qs ? `?${qs}` : ''}`);
}

export async function getNumber(id: string): Promise<VipNumber> {
  if (USE_MOCKS) {
    const found = MOCK_NUMBERS.find((n) => n.id === id);
    if (!found) throw new Error(`Number ${id} not found`);
    return found;
  }
  return apiFetch<VipNumber>(`/numbers/${encodeURIComponent(id)}`);
}
