import type {
  PersonPhysicalRequest,
  PersonPhysicalResponse,
  PersonLegalRequest,
  PersonLegalResponse,
  ContactRequest,
  ContactResponse,
  PersonAddressRequest,
  PersonAddressResponse,
  PageResponse,
} from "@/lib/types/personTypes";

export type {
  PersonPhysicalRequest,
  PersonPhysicalResponse,
  PersonLegalRequest,
  PersonLegalResponse,
  ContactRequest,
  ContactResponse,
  PersonAddressRequest,
  PersonAddressResponse,
  PageResponse,
};

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  tenantId: number;
  personId?: number | null;
  code?: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
  physical?: PersonPhysicalResponse | null;
  legal?: PersonLegalResponse | null;
  contacts?: ContactResponse[];
  addresses?: PersonAddressResponse[];
  // role fields (kept for backward compat)
  roleId?: number | null;
  roleName?: string | null;
  role?: { id: number; name: string } | null;
  roles?: Array<{ id: number; name: string }>;
  profile?: string | null;
  profiles?: string[];
  roleEnum?: string | null;
  roleEnums?: string[];
}

export interface UserRequest {
  tenantId?: number | null;
  email: string;
  /** Plain-text password; backend generates BCrypt hash. Never returned in response. */
  passwordHash?: string;
  active?: boolean;
  physical?: PersonPhysicalRequest | null;
  legal?: PersonLegalRequest | null;
  contacts?: ContactRequest[];
  addresses?: PersonAddressRequest[];
}

export interface UserPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Tenant (needed for selectors) ───────────────────────────────────────────

export interface TenantResponse {
  id: number;
  name?: string | null;
  category?: string | null;
  active: boolean;
  physical?: PersonPhysicalResponse | null;
  legal?: PersonLegalResponse | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const ADMIN_SEED_EMAIL = "admin@saas.com";
