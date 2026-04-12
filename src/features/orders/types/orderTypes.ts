// ─── Order item ───────────────────────────────────────────────────────────────

export interface OrderItemResponse {
  id: number;
  orderId: number;
  itemId: number;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
}

export interface OrderItemRequest {
  itemId: number;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface OrderResponse {
  id: number;
  code?: string | null;
  tenantId: number;
  customerId: number;
  userId: number;
  status: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currencyCode: string;
  notes?: string | null;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface OrderRequest {
  tenantId: number;
  customerId: number;
  userId: number;
  status: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currencyCode: string;
  notes?: string | null;
  items: OrderItemRequest[];
}

// ─── Catalog item ─────────────────────────────────────────────────────────────

export interface CatalogItemResponse {
  id: number;
  tenantId: number;
  name: string;
  description?: string | null;
  priceCents: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  name: string;
  email: string;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
