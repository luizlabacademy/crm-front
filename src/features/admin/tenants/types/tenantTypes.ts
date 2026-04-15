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

// ─── Tenant ───────────────────────────────────────────────────────────────────

export interface TenantResponse {
  id: number;
  parentTenantId?: number | null;
  code?: string;
  name?: string | null;
  category?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  active: boolean;
  physical?: PersonPhysicalResponse | null;
  legal?: PersonLegalResponse | null;
  contacts?: ContactResponse[];
  addresses?: PersonAddressResponse[];
}

export interface TenantRequest {
  parentTenantId?: number | null;
  name?: string | null;
  category?: string | null;
  active?: boolean;
  physical?: PersonPhysicalRequest | null;
  legal?: PersonLegalRequest | null;
  contacts?: ContactRequest[];
  addresses?: PersonAddressRequest[];
}
