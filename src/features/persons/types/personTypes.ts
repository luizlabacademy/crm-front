// ─── Raw API types ────────────────────────────────────────────────────────────

export interface PhysicalPerson {
  fullName: string;
  cpf?: string | null;
  birthDate?: string | null;
}

export interface LegalPerson {
  corporateName: string;
  tradeName?: string | null;
  cnpj?: string | null;
}

export interface Contact {
  id?: number;
  type: string;
  value: string;
  primary: boolean;
  active: boolean;
}

export interface PersonResponse {
  id: number;
  tenantId: number;
  active: boolean;
  physical?: PhysicalPerson | null;
  legal?: LegalPerson | null;
  contacts: Contact[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface PersonRequest {
  tenantId: number;
  active: boolean;
  physical?: PhysicalPerson | null;
  legal?: LegalPerson | null;
  contacts: Omit<Contact, "id">[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

export type PersonType = "physical" | "legal";

export function getPersonDisplayName(person: PersonResponse): string {
  if (person.physical?.fullName) return person.physical.fullName;
  if (person.legal?.corporateName) return person.legal.corporateName;
  return `Pessoa #${person.id}`;
}

export function getPersonDocument(person: PersonResponse): string {
  if (person.physical?.cpf) return person.physical.cpf;
  if (person.legal?.cnpj) return person.legal.cnpj;
  return "—";
}

export function getPersonType(person: PersonResponse): PersonType {
  return person.legal ? "legal" : "physical";
}
