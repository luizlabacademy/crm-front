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

// ─── Page Response ────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
