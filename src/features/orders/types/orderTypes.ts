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

// ─── Status colors ────────────────────────────────────────────────────────────

export const ORDER_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

// ─── Shared ───────────────────────────────────────────────────────────────────

export type { PageResponse } from "@/lib/types/personTypes";
