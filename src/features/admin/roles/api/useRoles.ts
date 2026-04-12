import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/api/client";
import type {
  RoleResponse,
  RoleRequest,
  RolePermissionSummary,
  RolePermissionsRequest,
  PageResponse,
} from "@/features/admin/roles/types/roleTypes";
import type { PermissionResponse } from "@/features/admin/permissions/types/permissionTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UseRolesParams {
  page?: number;
  size?: number;
}

export function useRoles(params: UseRolesParams = {}) {
  const { page = 0, size = 20 } = params;
  return useQuery<PageResponse<RoleResponse>>({
    queryKey: ["roles", { page, size }],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<RoleResponse>>(
        "/api/v1/roles",
        { params: { page, size } },
      );
      return data;
    },
  });
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function useRole(id: number | null) {
  return useQuery<RoleResponse>({
    queryKey: ["roles", id],
    queryFn: async () => {
      try {
        const { data } = await api.get<RoleResponse>(`/api/v1/roles/${id}`);
        return data;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          const { data } = await api.get<PageResponse<RoleResponse>>(
            "/api/v1/roles",
            {
              params: { page: 0, size: 500 },
            },
          );
          const found = data.content.find((role) => role.id === id);
          if (found) return found;
        }
        throw err;
      }
    },
    enabled: id != null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation<RoleResponse, Error, RoleRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<RoleResponse>("/api/v1/roles", body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation<RoleResponse, Error, { id: number; body: RoleRequest }>({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.put<RoleResponse>(`/api/v1/roles/${id}`, body);
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      void queryClient.invalidateQueries({ queryKey: ["roles", id] });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/roles/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

// ─── Permissions for role ─────────────────────────────────────────────────────

export function useRolePermissions(id: number | null) {
  return useQuery<RolePermissionSummary[]>({
    queryKey: ["roles", id, "permissions"],
    queryFn: async () => {
      try {
        const { data } = await api.get<RolePermissionSummary[]>(
          `/api/v1/roles/${id}/permissions`,
        );
        return data;
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          [404, 405].includes(err.response?.status ?? 0)
        ) {
          return [];
        }
        throw err;
      }
    },
    enabled: id != null,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    Error,
    { id: number; body: RolePermissionsRequest }
  >({
    mutationFn: async ({ id, body }) => {
      try {
        const { data } = await api.put(`/api/v1/roles/${id}/permissions`, body);
        return data;
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          [404, 405].includes(err.response?.status ?? 0)
        ) {
          const { data } = await api.post(
            `/api/v1/roles/${id}/permissions`,
            body,
          );
          return data;
        }
        throw err;
      }
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      void queryClient.invalidateQueries({ queryKey: ["roles", id] });
      void queryClient.invalidateQueries({
        queryKey: ["roles", id, "permissions"],
      });
    },
  });
}

// ─── Permissions catalog ──────────────────────────────────────────────────────

export function useAllPermissions() {
  return useQuery<PageResponse<PermissionResponse>>({
    queryKey: ["permissions", "catalog"],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<PermissionResponse>>(
        "/api/v1/permissions",
        { params: { page: 0, size: 500 } },
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
