/** Shared API domain types — aligned to the fancymobilenumber.in /web backend. */

export type SellerType = 'PREMIUM' | 'BASIC';

/**
 * A catalog number as returned by /web/*\/search and /web/product.
 * Prices arrive as comma-formatted strings (e.g. "24,999"); use parsePrice().
 */
export interface VipNumber {
  productid: string | number;
  productname: string;
  number: string;
  unit_price: string;
  compare_at_price: string;
  seller_type: SellerType;
  rating: number;
  cod: string;
  total: number;
  sum: number;
  speciality: string;
  star_status: string;
  comingsoon: string;
  coming_soon: string;
  comingsoon_date: string;
  discount_expiry: string;
  card_btn_text: string;
}

/** Server-driven taxonomy from /web/categories. */
export interface Category {
  id: string | number;
  name: string;
  detail: { slug: string; h1_tag: string; sub_heading: string };
  sub_categories: unknown[];
}

/** Standard list wrapper. `nextURL` = cursor (search), `count` = total (offset). */
export interface ListResponse<T> {
  data: T[];
  nextURL?: string | null;
  count?: number;
  total?: number;
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
