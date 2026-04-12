// ─── Raw API types ────────────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  tenantId: number;
  personId?: number | null;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
  roleId?: number | null;
  roleName?: string | null;
  role?: {
    id: number;
    name: string;
  } | null;
  roles?: Array<{
    id: number;
    name: string;
  }>;
  profile?: string | null;
  profiles?: string[];
  roleEnum?: string | null;
  roleEnums?: string[];
}

export interface UserRequest {
  tenantId: number;
  personId?: number | null;
  email: string;
  /** Plain-text password; backend gera o hash BCrypt. Nunca retornado na response. */
  passwordHash: string;
  active: boolean;
  roleIds?: number[];
}

export interface UserPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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

// ─── Constants ────────────────────────────────────────────────────────────────

export const ADMIN_SEED_EMAIL = "admin@saas.com";
