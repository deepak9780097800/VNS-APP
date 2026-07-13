/** Shared API domain types — aligned to the fancymobilenumber.in /web backend. */

export type SellerTier = 'premium' | 'basic';

/**
 * A catalog number as returned by /web/*\/search and /web/product.
 * Prices arrive as DECIMAL strings (e.g. "3820.00"); use parsePrice().
 * seller_type is lowercase ("basic"|"premium") — normalize via sellerTier().
 * Pattern info lives in `category`/`sub_category` (|##|-separated), not always
 * in `speciality`. `comingsoon`/`star_status` are NOT availability signals.
 */
export interface VipNumber {
  productid: number;
  number: string;
  productname: string;
  seller_type: string;
  seller_status: string;
  product_status: string;
  star_status: string;
  unit_price: string;
  price_with_gst: string;
  gst_price: string;
  compare_at_price: string;
  discount_expiry: string | null;
  total: number;
  sum: number;
  rtp: string;
  comingsoon: string;
  comingsoon_date: string | null;
  rtp_date: string | null;
  category: string;
  sub_category: string;
  speciality: string;
  created_at: string;
  updated_at: string;
  prefix_2?: string;
  prefix_3?: string;
  prefix_4?: string;
  prefix_5?: string;
  suffix_2?: string;
  suffix_3?: string;
  suffix_4?: string;
  suffix_5?: string;
}

/** A sub-category — its `id` is what /web/categories/search filters on. */
export interface SubCategory {
  id: number;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detail?: any;
}

/**
 * Server-driven taxonomy from /web/categories.
 * `detail` is a loose/legacy SEO object — do NOT use it for display; use `name`.
 */
export interface Category {
  id: string | number;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detail?: any;
  sub_categories: SubCategory[];
}

/**
 * Standard list wrapper. Pagination is cursor-based: follow `nextURL`;
 * `previousURL === null` means first page. `total`/`info` are per-page counts,
 * NOT a reliable grand total — do not use for offset page math.
 */
export interface ListResponse<T> {
  status: string;
  message: unknown;
  data: T[];
  nextURL: string | null;
  previousURL: string | null;
  total?: number;
  info?: number;
}

export interface User {
  id: string;
  name?: string;
  phone: string;
  email?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  numberId: string;
  number: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
}

/** Params for the tiered search fanout (/web/{tier}/search). */
export interface SearchNumbersParams {
  number?: string;
  /** 'PREMIUM' | 'BASIC' | 'BASIC,PREMIUM' */
  seller?: string;
  start_with?: string;
  end_with?: string;
  any_where?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
}

/** Params for category-filtered listing (/web/categories/search). */
export interface CategoryListParams {
  category: string;
  id: string | number;
  page?: number;
  paginate?: number;
}
