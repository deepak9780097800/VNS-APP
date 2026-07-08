/** Shared API domain types. Kept in sync with the future BFF layer. */

export type Operator =
  | 'Airtel'
  | 'Jio'
  | 'Vi'
  | 'BSNL'
  | 'Other';

export type NumberCategory =
  | 'VIP'
  | 'Fancy'
  | 'Premium'
  | 'Gold'
  | 'Platinum';

export interface VipNumber {
  id: string;
  number: string;
  price: number;
  mrp: number;
  operator: Operator;
  category: NumberCategory;
  /** e.g. "Repeating", "Sequential", "Mirror", "786" */
  patternTags: string[];
  isFreshStock: boolean;
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

/** Params accepted by the number search endpoint. */
export interface SearchNumbersParams {
  query?: string;
  operator?: Operator;
  category?: NumberCategory;
  minPrice?: number;
  maxPrice?: number;
  patternTag?: string;
}
