import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  CustomerResponse,
  CustomerRequest,
  PageResponse,
} from "@/features/customers/types/customerTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UseCustomersParams {
  page?: number;
  size?: number;
  tenantId?: number | null;
}

export function useCustomers(params: UseCustomersParams = {}) {
  const { page = 0, size = 20, tenantId } = params;
  return useQuery<PageResponse<CustomerResponse>>({
    queryKey: ["customers", { page, size, tenantId }],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<CustomerResponse>>(
        "/api/v1/customers",
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

export function useCustomer(id: number | null) {
  return useQuery<CustomerResponse>({
    queryKey: ["customers", id],
    queryFn: async () => {
      const { data } = await api.get<CustomerResponse>(
        `/api/v1/customers/${id}`,
      );
      return data;
    },
    enabled: id != null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation<CustomerResponse, Error, CustomerRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<CustomerResponse>(
        "/api/v1/customers",
        body,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation<
    CustomerResponse,
    Error,
    { id: number; body: CustomerRequest }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.put<CustomerResponse>(
        `/api/v1/customers/${id}`,
        body,
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      void queryClient.invalidateQueries({ queryKey: ["customers", id] });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/customers/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
