// ─── Shared person sub-schemas (embedded in customers, workers, users, tenants) ─

export interface PersonPhysicalRequest {
  fullName?: string | null;
  cpf?: string | null;
  birthDate?: string | null; // YYYY-MM-DD
}

export interface PersonPhysicalResponse {
  fullName?: string | null;
  cpf?: string | null;
  birthDate?: string | null;
}

export interface PersonLegalRequest {
  corporateName?: string | null;
  tradeName?: string | null;
  cnpj?: string | null;
}

export interface PersonLegalResponse {
  corporateName?: string | null;
  tradeName?: string | null;
  cnpj?: string | null;
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export interface ContactRequest {
  type?: string | null;
  contactValue?: string | null;
  active?: boolean;
  primary?: boolean;
}

export interface ContactResponse {
  id?: number;
  type?: string | null;
  contactValue?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  active?: boolean;
  primary?: boolean;
}

// ─── Address ──────────────────────────────────────────────────────────────────

export type AddressType = "RESIDENTIAL" | "COMMERCIAL";

export interface PersonAddressRequest {
  id?: number | null;
  type?: AddressType | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  cityId?: number | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  active?: boolean;
  primary?: boolean;
}

export interface PersonAddressResponse {
  id?: number;
  type?: AddressType | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  cityId?: number | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  active?: boolean;
  primary?: boolean;
}

// ─── Page response wrapper ───────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the best display name from physical or legal sub-object */
export function getEntityDisplayName(entity: {
  fullName?: string | null;
  physical?: PersonPhysicalResponse | null;
  legal?: PersonLegalResponse | null;
}): string {
  if (entity.physical?.fullName) return entity.physical.fullName;
  if (entity.legal?.tradeName) return entity.legal.tradeName;
  if (entity.legal?.corporateName) return entity.legal.corporateName;
  if (entity.fullName) return entity.fullName;
  return "—";
}

/** Returns CPF or CNPJ from the entity's physical/legal sub-object */
export function getEntityDocument(entity: {
  physical?: PersonPhysicalResponse | null;
  legal?: PersonLegalResponse | null;
}): string {
  if (entity.physical?.cpf) return entity.physical.cpf;
  if (entity.legal?.cnpj) return entity.legal.cnpj;
  return "—";
}

/** Returns "Física" | "Jurídica" | "—" */
export function getEntityPersonType(entity: {
  physical?: PersonPhysicalResponse | null;
  legal?: PersonLegalResponse | null;
}): string {
  if (entity.physical?.fullName || entity.physical?.cpf) return "Física";
  if (entity.legal?.corporateName || entity.legal?.cnpj) return "Jurídica";
  return "—";
}
