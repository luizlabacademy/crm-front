import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  UnitOfMeasureResponse,
  PageResponse,
} from "@/features/catalog/units-of-measure/types/unitOfMeasureTypes";

// ─── List (paginated) ─────────────────────────────────────────────────────────

interface UseUnitsOfMeasureParams {
  page?: number;
  size?: number;
}

export function useUnitsOfMeasure(params: UseUnitsOfMeasureParams = {}) {
  const { page = 0, size = 20 } = params;
  return useQuery<PageResponse<UnitOfMeasureResponse>>({
    queryKey: ["units-of-measure", { page, size }],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<UnitOfMeasureResponse>>(
        "/api/v1/units-of-measure",
        { params: { page, size } },
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Catalog (all, for dropdowns/selectors) ───────────────────────────────────

export function useUnitsOfMeasureCatalog() {
  return useQuery<UnitOfMeasureResponse[]>({
    queryKey: ["units-of-measure-catalog"],
    queryFn: async () => {
      const { data } = await api.get<
        PageResponse<UnitOfMeasureResponse> | UnitOfMeasureResponse[]
      >("/api/v1/units-of-measure", { params: { page: 0, size: 999 } });
      if (Array.isArray(data)) return data;
      return data.content ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
