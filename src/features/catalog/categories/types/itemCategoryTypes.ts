// ─── Item Category ────────────────────────────────────────────────────────────

export interface ItemCategoryResponse {
  id: number;
  tenantId: number;
  name: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ItemCategoryRequest {
  tenantId: number;
  name: string;
  description?: string | null;
  active: boolean;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export type { PageResponse } from "@/lib/types/personTypes";
