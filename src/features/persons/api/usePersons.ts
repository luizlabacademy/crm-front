import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  PersonResponse,
  PersonRequest,
  PageResponse,
} from "@/features/persons/types/personTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UsePersonsParams {
  page?: number;
  size?: number;
  tenantId?: number | null;
}

export function usePersons(params: UsePersonsParams = {}) {
  const { page = 0, size = 20, tenantId } = params;
  return useQuery<PageResponse<PersonResponse>>({
    queryKey: ["persons", { page, size, tenantId }],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<PersonResponse>>(
        "/api/v1/persons",
        {
          params: {
            page,
            size,
            ...(tenantId != null ? { tenantId } : {}),
          },
        },
      );
      return data;
    },
  });
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function usePerson(id: number | null) {
  return useQuery<PersonResponse>({
    queryKey: ["persons", id],
    queryFn: async () => {
      const { data } = await api.get<PersonResponse>(`/api/v1/persons/${id}`);
      return data;
    },
    enabled: id != null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation<PersonResponse, Error, PersonRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<PersonResponse>("/api/v1/persons", body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["persons"] });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation<
    PersonResponse,
    Error,
    { id: number; body: PersonRequest }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.put<PersonResponse>(
        `/api/v1/persons/${id}`,
        body,
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["persons"] });
      void queryClient.invalidateQueries({ queryKey: ["persons", id] });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/persons/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["persons"] });
    },
  });
}
