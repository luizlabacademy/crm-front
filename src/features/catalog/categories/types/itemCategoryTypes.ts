// ─── Item Category ────────────────────────────────────────────────────────────

export type ItemCategoryAvailableType = "PRODUCT" | "SERVICE";

export interface ItemCategoryResponse {
  id: number;
  tenantId: number;
  name: string;
  showOnSite: boolean;
  availableTypes: ItemCategoryAvailableType[];
  photo?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ItemCategoryRequest {
  tenantId: number;
  name: string;
  showOnSite: boolean;
  availableTypes: ItemCategoryAvailableType[];
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export type { PageResponse } from "@/lib/types/personTypes";
