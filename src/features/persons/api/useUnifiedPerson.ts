/**
 * useUnifiedPerson
 *
 * Hook unificado de pessoa que abstrai a separação entre Person, User, Worker,
 * Customer e Tenant no banco de dados. O front-end trabalha com um tipo único
 * `UnifiedPerson` enriquecido com todos os perfis vinculados, enquanto a API
 * continua retornando entidades separadas. Este arquivo faz a mesclagem de forma
 * transparente ao restante da aplicação.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  PersonResponse,
  PersonRequest,
} from "@/features/persons/types/personTypes";
import type { UserResponse } from "@/features/admin/users/types/userTypes";
import type { CustomerResponse } from "@/features/customers/types/customerTypes";
import {
  getPersonDisplayName,
  getPersonDocument,
} from "@/features/persons/types/personTypes";

// ─── Unified Type ─────────────────────────────────────────────────────────────

/**
 * Represents a fully merged person with all linked profiles.
 * The front-end works with this type directly.
 */
export interface UnifiedPerson {
  /** The canonical person record id */
  personId: number;
  tenantId: number;
  active: boolean;

  /** Derived display name from physical or legal person */
  displayName: string;
  /** Derived document (CPF or CNPJ) */
  document: string;

  /** Primary contact email (from contacts array) */
  email?: string;
  /** Primary contact phone (from contacts array) */
  phone?: string;

  /** Which profiles this person has */
  profiles: {
    isUser: boolean;
    isCustomer: boolean;
    isWorker: boolean;
  };

  /** Raw sub-records when loaded (lazy — may be undefined) */
  person: PersonResponse;
  user?: UserResponse;
  customer?: CustomerResponse;

  /** All raw contacts */
  contacts: PersonResponse["contacts"];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPrimaryContact(
  contacts: PersonResponse["contacts"],
  type: string,
): string | undefined {
  const primary = contacts.find(
    (c) => c.active && c.type.toLowerCase() === type.toLowerCase() && c.primary,
  );
  return (
    primary?.value ??
    contacts.find(
      (c) => c.active && c.type.toLowerCase() === type.toLowerCase(),
    )?.value
  );
}

function mergePersonWithProfiles(
  person: PersonResponse,
  user?: UserResponse,
  customer?: CustomerResponse,
): UnifiedPerson {
  return {
    personId: person.id,
    tenantId: person.tenantId,
    active: person.active,
    displayName: getPersonDisplayName(person),
    document: getPersonDocument(person),
    email: user?.email ?? getPrimaryContact(person.contacts, "email"),
    phone:
      getPrimaryContact(person.contacts, "phone") ??
      getPrimaryContact(person.contacts, "whatsapp"),
    profiles: {
      isUser: !!user,
      isCustomer: !!customer,
      isWorker: false, // extended when worker API is implemented
    },
    person,
    user,
    customer,
    contacts: person.contacts,
  };
}

// ─── Params ───────────────────────────────────────────────────────────────────

export interface UseUnifiedPersonsParams {
  page?: number;
  size?: number;
  tenantId?: number | null;
  /** Enrich results with linked user/customer profiles (extra API calls) */
  enrich?: boolean;
}

// ─── List (lightweight — Person only, no enrichment) ─────────────────────────

export function useUnifiedPersons(params: UseUnifiedPersonsParams = {}) {
  const { page = 0, size = 20, tenantId } = params;

  return useQuery<{
    content: UnifiedPerson[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }>({
    queryKey: ["unified-persons", { page, size, tenantId }],
    queryFn: async () => {
      const { data } = await api.get<{
        content: PersonResponse[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      }>("/api/v1/persons", {
        params: {
          page,
          size,
          ...(tenantId != null ? { tenantId } : {}),
        },
      });

      // Lightweight merge without extra calls
      const content = data.content.map((p) => mergePersonWithProfiles(p));

      return {
        content,
        page: data.page,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      };
    },
  });
}

// ─── Single (enriched — fetches user + customer in parallel) ─────────────────

export function useUnifiedPerson(personId: number | null) {
  return useQuery<UnifiedPerson>({
    queryKey: ["unified-person", personId],
    queryFn: async () => {
      // 1. Fetch the base person
      const { data: person } = await api.get<PersonResponse>(
        `/api/v1/persons/${personId}`,
      );

      // 2. Try to find a linked user (search by personId query param)
      let user: UserResponse | undefined;
      try {
        const { data: usersPage } = await api.get<{ content: UserResponse[] }>(
          "/api/v1/users",
          {
            params: { personId, page: 0, size: 1 },
          },
        );
        user = usersPage.content[0];
      } catch {
        // user link not found — not all persons have user accounts
      }

      // 3. Try to find a linked customer
      let customer: CustomerResponse | undefined;
      try {
        const { data: customersPage } = await api.get<{
          content: CustomerResponse[];
        }>("/api/v1/customers", {
          params: { personId, page: 0, size: 1 },
        });
        customer = customersPage.content[0];
      } catch {
        // customer link not found — not all persons are customers
      }

      return mergePersonWithProfiles(person, user, customer);
    },
    enabled: personId != null,
  });
}

// ─── Create (creates person + optionally customer/user) ──────────────────────

export interface CreateUnifiedPersonRequest {
  person: PersonRequest;
  /** If true, also creates a Customer record linked to this person */
  createAsCustomer?: boolean;
  /** If true, also creates a User record linked to this person */
  createAsUser?: boolean;
  userEmail?: string;
  userTenantId?: number;
}

export function useCreateUnifiedPerson() {
  const queryClient = useQueryClient();

  return useMutation<UnifiedPerson, Error, CreateUnifiedPersonRequest>({
    mutationFn: async ({
      person: personBody,
      createAsCustomer,
      createAsUser,
      userEmail,
      userTenantId,
    }) => {
      // 1. Create the person first
      const { data: person } = await api.post<PersonResponse>(
        "/api/v1/persons",
        personBody,
      );

      let user: UserResponse | undefined;
      let customer: CustomerResponse | undefined;

      // 2. Optionally create user
      if (createAsUser && userEmail) {
        try {
          const { data } = await api.post<UserResponse>("/api/v1/users", {
            tenantId: userTenantId ?? person.tenantId,
            personId: person.id,
            email: userEmail,
            active: true,
          });
          user = data;
        } catch {
          // non-critical — person was still created
        }
      }

      // 3. Optionally create customer
      if (createAsCustomer) {
        const displayName = getPersonDisplayName(person);
        try {
          const { data } = await api.post<CustomerResponse>(
            "/api/v1/customers",
            {
              tenantId: person.tenantId,
              personId: person.id,
              fullName: displayName,
              active: true,
            },
          );
          customer = data;
        } catch {
          // non-critical — person was still created
        }
      }

      return mergePersonWithProfiles(person, user, customer);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["unified-persons"] });
      void queryClient.invalidateQueries({ queryKey: ["persons"] });
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ─── Update person (base fields only) ────────────────────────────────────────

export function useUpdateUnifiedPerson() {
  const queryClient = useQueryClient();

  return useMutation<
    UnifiedPerson,
    Error,
    { personId: number; body: PersonRequest }
  >({
    mutationFn: async ({ personId, body }) => {
      const { data: person } = await api.put<PersonResponse>(
        `/api/v1/persons/${personId}`,
        body,
      );
      return mergePersonWithProfiles(person);
    },
    onSuccess: (_data, { personId }) => {
      void queryClient.invalidateQueries({ queryKey: ["unified-persons"] });
      void queryClient.invalidateQueries({
        queryKey: ["unified-person", personId],
      });
      void queryClient.invalidateQueries({ queryKey: ["persons"] });
    },
  });
}

// ─── Link an existing person to a customer profile ───────────────────────────

export function useLinkPersonAsCustomer() {
  const queryClient = useQueryClient();

  return useMutation<
    CustomerResponse,
    Error,
    { personId: number; tenantId: number; fullName?: string }
  >({
    mutationFn: async ({ personId, tenantId, fullName }) => {
      const { data } = await api.post<CustomerResponse>("/api/v1/customers", {
        tenantId,
        personId,
        fullName: fullName ?? `Cliente #${personId}`,
        active: true,
      });
      return data;
    },
    onSuccess: (_data, { personId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["unified-person", personId],
      });
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// ─── Search persons (for dropdowns / conversation starters) ──────────────────

export function useSearchPersons(search: string, tenantId?: number | null) {
  return useQuery<UnifiedPerson[]>({
    queryKey: ["search-persons", search, tenantId],
    queryFn: async () => {
      const { data } = await api.get<{ content: PersonResponse[] }>(
        "/api/v1/persons",
        {
          params: {
            page: 0,
            size: 30,
            ...(tenantId != null ? { tenantId } : {}),
            ...(search ? { search } : {}),
          },
        },
      );
      return data.content.map((p) => mergePersonWithProfiles(p));
    },
    enabled: search.length > 1 || search.length === 0,
    staleTime: 30 * 1000,
  });
}
