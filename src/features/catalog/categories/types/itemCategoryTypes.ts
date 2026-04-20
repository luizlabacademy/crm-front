// ─── Item Category ────────────────────────────────────────────────────────────

export type ItemCategoryAvailableType = "PRODUCT" | "SERVICE";

export interface ItemCategoryResponse {
  id: number;
  tenantId: number;
  name: string;
  description?: string | null;
  showOnSite?: boolean | null;
  sortOrder?: number | null;
  availableTypes: ItemCategoryAvailableType[];
  photo?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ItemCategoryRequest {
  tenantId: number;
  name: string;
  description?: string | null;
  showOnSite: boolean;
  sortOrder?: number;
  availableTypes: ItemCategoryAvailableType[];
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export type { PageResponse } from "@/lib/types/personTypes";
