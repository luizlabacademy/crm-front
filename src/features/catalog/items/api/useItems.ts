import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  ItemResponse,
  ItemListResponse,
  ItemRequest,
  ItemCategoryRelation,
  ItemType,
  PageResponse,
} from "@/features/catalog/items/types/itemTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UseItemsParams {
  page?: number;
  size?: number;
  tenantId?: number | null;
  categoryId?: number | null;
  search?: string;
  type?: ItemType;
}

export function useItems(params: UseItemsParams = {}) {
  const { page = 0, size = 20, tenantId, categoryId, search, type } = params;
  return useQuery<PageResponse<ItemListResponse>>({
    queryKey: ["items", { page, size, tenantId, categoryId, search, type }],
    queryFn: async () => {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        api.get<PageResponse<ItemListResponse>>("/api/v1/items", {
          params: {
            page,
            size,
            ...(type ? { type } : {}),
            ...(tenantId != null ? { tenantId } : {}),
            ...(categoryId != null ? { categoryId } : {}),
            ...(search ? { name: search } : {}),
          },
        }),
        api
          .get<PageResponse<ItemCategoryRelation> | ItemCategoryRelation[]>(
            "/api/v1/item-categories",
            {
              params: { page: 0, size: 500, ...(tenantId != null ? { tenantId } : {}) },
            },
          )
          .catch(() => null),
      ]);

      const data = itemsResponse.data;
      const categoryList =
        categoriesResponse == null
          ? []
          : Array.isArray(categoriesResponse.data)
            ? categoriesResponse.data
            : (categoriesResponse.data.content ?? []);

      const categoryById = new Map<number, ItemCategoryRelation>(
        categoryList.map((c) => [c.id, c]),
      );

      return {
        ...data,
        content: (data.content ?? []).map((item) => {
          const cat =
            item.categoryId != null ? categoryById.get(item.categoryId) : null;
          return {
            ...item,
            category: cat ?? null,
            categoryName: cat?.name ?? null,
          };
        }),
      };
    },
  });
}

// ─── Single (full detail) ─────────────────────────────────────────────────────

export function useItem(id: number | null) {
  return useQuery<ItemResponse>({
    queryKey: ["items", id],
    queryFn: async () => {
      if (id == null) throw new Error("Item ID obrigatorio");

      const { data } = await api.get<ItemResponse>(`/api/v1/items/${id}`);

      // Enrich with category name
      let category: ItemCategoryRelation | null = null;
      if (data.categoryId != null) {
        try {
          const catRes = await api.get<ItemCategoryRelation>(
            `/api/v1/item-categories/${data.categoryId}`,
          );
          category = catRes.data;
        } catch {
          // ignore
        }
      }

      return {
        ...data,
        category,
        categoryName: category?.name ?? null,
      };
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
    },
  });
}
