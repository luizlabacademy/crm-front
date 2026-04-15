import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  WorkerResponse,
  WorkerRequest,
  PageResponse,
  TenantSummary,
} from "@/features/admin/workers/types/workerTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UseWorkersParams {
  page?: number;
  size?: number;
  tenantId?: number | null;
}

export function useWorkers(params: UseWorkersParams = {}) {
  const { page = 0, size = 20, tenantId } = params;
  return useQuery<PageResponse<WorkerResponse>>({
    queryKey: ["workers", { page, size, tenantId }],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<WorkerResponse>>(
        "/api/v1/workers",
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

export function useWorker(id: number | null) {
  return useQuery<WorkerResponse>({
    queryKey: ["workers", id],
    queryFn: async () => {
      const { data } = await api.get<WorkerResponse>(`/api/v1/workers/${id}`);
      return data;
    },
    enabled: id != null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation<WorkerResponse, Error, WorkerRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<WorkerResponse>("/api/v1/workers", body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateWorker() {
  const queryClient = useQueryClient();
  return useMutation<
    WorkerResponse,
    Error,
    { id: number; body: WorkerRequest }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.put<WorkerResponse>(
        `/api/v1/workers/${id}`,
        body,
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["workers"] });
      void queryClient.invalidateQueries({ queryKey: ["workers", id] });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteWorker() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/workers/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}

// ─── Tenants selector ─────────────────────────────────────────────────────────

export function useTenantsList() {
  return useQuery<PageResponse<TenantSummary>>({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<TenantSummary>>(
        "/api/v1/tenants",
        { params: { page: 0, size: 100 } },
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
