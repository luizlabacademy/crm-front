// ─── Item ─────────────────────────────────────────────────────────────────────

export interface ItemResponse {
  id: number;
  tenantId: number;
  categoryId?: number | null;
  categoryName?: string | null;
  name: string;
  description?: string | null;
  priceCents: number;
  unit?: string | null;
  sku?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ItemRequest {
  tenantId: number;
  categoryId?: number | null;
  name: string;
  description?: string | null;
  priceCents: number;
  unit?: string | null;
  sku?: string | null;
  active: boolean;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export type { PageResponse } from "@/lib/types/personTypes";
