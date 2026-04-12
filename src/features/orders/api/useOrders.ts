import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  OrderResponse,
  OrderRequest,
  CatalogItemResponse,
  UserResponse,
  PageResponse,
} from "@/features/orders/types/orderTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UseOrdersParams {
  page?: number;
  size?: number;
  tenantId?: number | null;
}

export function useOrders(params: UseOrdersParams = {}) {
  const { page = 0, size = 20, tenantId } = params;
  return useQuery<PageResponse<OrderResponse>>({
    queryKey: ["orders", { page, size, tenantId }],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<OrderResponse>>(
        "/api/v1/orders",
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

export function useOrder(id: number | null) {
  return useQuery<OrderResponse>({
    queryKey: ["orders", id],
    queryFn: async () => {
      const { data } = await api.get<OrderResponse>(`/api/v1/orders/${id}`);
      return data;
    },
    enabled: id != null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation<OrderResponse, Error, OrderRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<OrderResponse>("/api/v1/orders", body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation<OrderResponse, Error, { id: number; body: OrderRequest }>({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.put<OrderResponse>(
        `/api/v1/orders/${id}`,
        body,
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/orders/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// ─── Catalog items ────────────────────────────────────────────────────────────

export function useCatalogItems(tenantId?: number | null) {
  return useQuery<CatalogItemResponse[]>({
    queryKey: ["catalog-items", tenantId],
    queryFn: async () => {
      const { data } = await api.get<
        PageResponse<CatalogItemResponse> | CatalogItemResponse[]
      >("/api/v1/items", {
        params: {
          page: 0,
          size: 100,
          ...(tenantId != null ? { tenantId } : {}),
        },
      });
      if (Array.isArray(data)) return data;
      return (data as PageResponse<CatalogItemResponse>).content ?? [];
    },
    enabled: true,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function useUsers() {
  return useQuery<UserResponse[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<
        PageResponse<UserResponse> | UserResponse[]
      >("/api/v1/users", { params: { page: 0, size: 100 } });
      if (Array.isArray(data)) return data;
      return (data as PageResponse<UserResponse>).content ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
