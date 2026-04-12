// ─── Raw API types ────────────────────────────────────────────────────────────

export interface CustomerResponse {
  id: number;
  code?: string;
  tenantId: number;
  personId?: number | null;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  active: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CustomerRequest {
  tenantId: number;
  personId?: number | null;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  active: boolean;
  notes?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ─── Tenant (needed for selectors) ───────────────────────────────────────────

export interface TenantResponse {
  id: number;
  name: string;
  active: boolean;
}
