import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  TenantResponse,
  TenantRequest,
  PageResponse,
} from "@/features/admin/tenants/types/tenantTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UseTenantsParams {
  page?: number;
  size?: number;
}

export function useTenants(params: UseTenantsParams = {}) {
  const { page = 0, size = 20 } = params;
  return useQuery<PageResponse<TenantResponse>>({
    queryKey: ["tenants", { page, size }],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<TenantResponse>>(
        "/api/v1/tenants",
        { params: { page, size } },
      );
      return data;
    },
  });
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function useTenant(id: number | null) {
  return useQuery<TenantResponse>({
    queryKey: ["tenants", id],
    queryFn: async () => {
      const { data } = await api.get<TenantResponse>(`/api/v1/tenants/${id}`);
      return data;
    },
    enabled: id != null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation<TenantResponse, Error, TenantRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<TenantResponse>("/api/v1/tenants", body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation<
    TenantResponse,
    Error,
    { id: number; body: TenantRequest }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.put<TenantResponse>(
        `/api/v1/tenants/${id}`,
        body,
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["tenants"] });
      void queryClient.invalidateQueries({ queryKey: ["tenants", id] });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/tenants/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}
