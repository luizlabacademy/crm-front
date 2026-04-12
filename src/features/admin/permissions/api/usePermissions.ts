import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  PermissionResponse,
  PermissionRequest,
  PageResponse,
} from "@/features/admin/permissions/types/permissionTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UsePermissionsParams {
  page?: number;
  size?: number;
}

export function usePermissions(params: UsePermissionsParams = {}) {
  const { page = 0, size = 20 } = params;
  return useQuery<PageResponse<PermissionResponse>>({
    queryKey: ["permissions", { page, size }],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<PermissionResponse>>(
        "/api/v1/permissions",
        { params: { page, size } },
      );
      return data;
    },
  });
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function usePermission(id: number | null) {
  return useQuery<PermissionResponse>({
    queryKey: ["permissions", id],
    queryFn: async () => {
      const { data } = await api.get<PermissionResponse>(
        `/api/v1/permissions/${id}`,
      );
      return data;
    },
    enabled: id != null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation<PermissionResponse, Error, PermissionRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<PermissionResponse>(
        "/api/v1/permissions",
        body,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation<
    PermissionResponse,
    Error,
    { id: number; body: PermissionRequest }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.put<PermissionResponse>(
        `/api/v1/permissions/${id}`,
        body,
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] });
      void queryClient.invalidateQueries({ queryKey: ["permissions", id] });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/permissions/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}
