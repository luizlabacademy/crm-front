// ─── Raw API types ────────────────────────────────────────────────────────────

export interface PermissionResponse {
  id: number;
  code: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
}

export interface PermissionRequest {
  code: string;
  description?: string | null;
  active: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
