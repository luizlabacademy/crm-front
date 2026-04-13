import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  ItemResponse,
  ItemRequest,
  PageResponse,
} from "@/features/catalog/items/types/itemTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UseItemsParams {
  page?: number;
  size?: number;
  tenantId?: number | null;
  categoryId?: number | null;
  search?: string;
}

export function useItems(params: UseItemsParams = {}) {
  const { page = 0, size = 20, tenantId, categoryId, search } = params;
  return useQuery<PageResponse<ItemResponse>>({
    queryKey: ["items", { page, size, tenantId, categoryId, search }],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<ItemResponse>>(
        "/api/v1/items",
        {
          params: {
            page,
            size,
            ...(tenantId != null ? { tenantId } : {}),
            ...(categoryId != null ? { categoryId } : {}),
            ...(search ? { search } : {}),
          },
        },
      );
      return data;
    },
  });
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function useItem(id: number | null) {
  return useQuery<ItemResponse>({
    queryKey: ["items", id],
    queryFn: async () => {
      const { data } = await api.get<ItemResponse>(`/api/v1/items/${id}`);
      return data;
    },
    enabled: id != null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation<ItemResponse, Error, ItemRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<ItemResponse>("/api/v1/items", body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["items"] });
      void queryClient.invalidateQueries({ queryKey: ["catalog-items"] });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation<ItemResponse, Error, { id: number; body: ItemRequest }>({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.put<ItemResponse>(`/api/v1/items/${id}`, body);
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["items"] });
      void queryClient.invalidateQueries({ queryKey: ["items", id] });
      void queryClient.invalidateQueries({ queryKey: ["catalog-items"] });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/items/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["items"] });
      void queryClient.invalidateQueries({ queryKey: ["catalog-items"] });
    },
  });
}
