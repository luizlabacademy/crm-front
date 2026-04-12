// ─── Raw API types ────────────────────────────────────────────────────────────

export interface RoleResponse {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
  permissions?: RolePermissionSummary[];
}

export interface RolePermissionSummary {
  id: number;
  code: string;
  description?: string | null;
  active?: boolean;
}

export interface RoleRequest {
  name: string;
  description?: string | null;
  active: boolean;
}

export interface RolePermissionsRequest {
  permissionIds: number[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
