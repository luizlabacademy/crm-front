import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  ItemCategoryResponse,
  ItemCategoryRequest,
  ItemCategoryAvailableType,
  PageResponse,
} from "@/features/catalog/categories/types/itemCategoryTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UseItemCategoriesParams {
  page?: number;
  size?: number;
  tenantId?: number | null;
  name?: string;
  showOnSite?: boolean;
  availableTypes?: ItemCategoryAvailableType;
}

export function useItemCategories(params: UseItemCategoriesParams = {}) {
  const { page = 0, size = 20, tenantId, name, showOnSite, availableTypes } =
    params;
  return useQuery<PageResponse<ItemCategoryResponse>>({
    queryKey: [
      "item-categories",
      { page, size, tenantId, name, showOnSite, availableTypes },
    ],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<ItemCategoryResponse>>(
        "/api/v1/item-categories",
        {
          params: {
            page,
            size,
            ...(tenantId != null ? { tenantId } : {}),
            ...(name ? { name } : {}),
            ...(showOnSite != null ? { showOnSite } : {}),
            ...(availableTypes ? { availableTypes } : {}),
          },
        },
      );
      return data;
    },
  });
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function useItemCategory(id: number | null) {
  return useQuery<ItemCategoryResponse>({
    queryKey: ["item-categories", id],
    queryFn: async () => {
      const { data } = await api.get<ItemCategoryResponse>(
        `/api/v1/item-categories/${id}`,
      );
      return data;
    },
    enabled: id != null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateItemCategory() {
  const queryClient = useQueryClient();
  return useMutation<ItemCategoryResponse, Error, ItemCategoryRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<ItemCategoryResponse>(
        "/api/v1/item-categories",
        body,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["item-categories"] });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateItemCategory() {
  const queryClient = useQueryClient();
  return useMutation<
    ItemCategoryResponse,
    Error,
    { id: number; body: ItemCategoryRequest }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.put<ItemCategoryResponse>(
        `/api/v1/item-categories/${id}`,
        body,
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["item-categories"] });
      void queryClient.invalidateQueries({ queryKey: ["item-categories", id] });
    },
  });
}

export function usePatchItemCategory() {
  const queryClient = useQueryClient();
  return useMutation<
    ItemCategoryResponse,
    Error,
    { id: number; body: Partial<ItemCategoryRequest> }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.patch<ItemCategoryResponse>(
        `/api/v1/item-categories/${id}`,
        body,
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["item-categories"] });
      void queryClient.invalidateQueries({ queryKey: ["item-categories", id] });
    },
  });
}

// ─── Sort order (bulk) ───────────────────────────────────────────────────────

export function useSortItemCategories() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { items: { id: number; sortOrder: number }[] }>(
    {
      mutationFn: async (body) => {
        await api.patch("/api/v1/item-categories/sort-order", body);
      },
      onSuccess: () => {
        // Invalidate catalog only; list views subscribe to their own query keys
        // to avoid triggering multiple list refetches in different pages.
        void queryClient.invalidateQueries({ queryKey: ["item-categories-catalog"] });
      },
    },
  );
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteItemCategory() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/item-categories/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["item-categories"] });
    },
  });
}

// ─── Catalog (all categories for dropdowns) ───────────────────────────────────

export function useItemCategoriesCatalog(tenantId?: number | null) {
  return useQuery<ItemCategoryResponse[]>({
    queryKey: ["item-categories-catalog", tenantId],
    queryFn: async () => {
      const { data } = await api.get<
        PageResponse<ItemCategoryResponse> | ItemCategoryResponse[]
      >("/api/v1/item-categories", {
        params: {
          page: 0,
          size: 200,
          ...(tenantId != null ? { tenantId } : {}),
        },
      });
      if (Array.isArray(data)) return data;
      return data.content ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Service categories (for landing page) ────────────────────────────────────

export function useServiceCategories(tenantId?: number | null) {
  const query = useItemCategoriesCatalog(tenantId);
  const serviceCategories = (query.data ?? []).filter((cat) =>
    cat.availableTypes?.includes("SERVICE"),
  );
  return {
    ...query,
    data: serviceCategories,
  };
}
