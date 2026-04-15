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

// ─── Worker ───────────────────────────────────────────────────────────────────

export interface WorkerResponse {
  id: number;
  code?: string;
  tenantId: number;
  personId?: number | null;
  userId?: number | null;
  createdAt?: string;
  updatedAt?: string | null;
  active: boolean;
  physical?: PersonPhysicalResponse | null;
  legal?: PersonLegalResponse | null;
  contacts?: ContactResponse[];
  addresses?: PersonAddressResponse[];
}

export interface WorkerRequest {
  tenantId?: number | null;
  userId?: number | null;
  active?: boolean;
  physical?: PersonPhysicalRequest | null;
  legal?: PersonLegalRequest | null;
  contacts?: ContactRequest[];
  addresses?: PersonAddressRequest[];
}

// ─── Tenant (needed for selectors) ───────────────────────────────────────────

export interface TenantSummary {
  id: number;
  name?: string | null;
  active: boolean;
}
