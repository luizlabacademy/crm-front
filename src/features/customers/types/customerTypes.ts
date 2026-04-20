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

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface CustomerResponse {
  id: number;
  code?: string;
  tenantId: number;
  personId?: number | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  active: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  photo?: string | null;
  physical?: PersonPhysicalResponse | null;
  legal?: PersonLegalResponse | null;
  contacts?: ContactResponse[];
  addresses?: PersonAddressResponse[];
}

export interface CustomerRequest {
  tenantId?: number | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  active?: boolean;
  notes?: string | null;
  physical?: PersonPhysicalRequest | null;
  legal?: PersonLegalRequest | null;
  contacts?: ContactRequest[];
  addresses?: PersonAddressRequest[];
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
