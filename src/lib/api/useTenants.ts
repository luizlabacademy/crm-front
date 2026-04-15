import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { TenantResponse } from "@/features/admin/tenants/types/tenantTypes";
import type { PageResponse } from "@/lib/types/personTypes";

/**
 * Canonical hook for fetching tenants as a selector/dropdown list.
 * Fetches up to 100 tenants with a 5-minute stale time.
 *
 * Use this instead of the duplicate `useTenants` / `useTenantsList` in feature API files.
 */
export function useTenantsSelector() {
  return useQuery<PageResponse<TenantResponse>>({
    queryKey: ["tenants", "selector"],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<TenantResponse>>(
        "/api/v1/tenants",
        { params: { page: 0, size: 100 } },
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
