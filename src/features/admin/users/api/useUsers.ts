import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/api/client";
import type {
  UserResponse,
  UserRequest,
  UserPasswordChangeRequest,
  PageResponse,
} from "@/features/admin/users/types/userTypes";
import type { RoleResponse } from "@/features/admin/roles/types/roleTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UseUsersParams {
  page?: number;
  size?: number;
  tenantId?: number | null;
}

export function useUsers(params: UseUsersParams = {}) {
  const { page = 0, size = 20, tenantId } = params;
  return useQuery<PageResponse<UserResponse>>({
    queryKey: ["users", { page, size, tenantId }],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<UserResponse>>(
        "/api/v1/users",
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

export function useUser(id: number | null) {
  return useQuery<UserResponse>({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data } = await api.get<UserResponse>(`/api/v1/users/${id}`);
      return data;
    },
    enabled: id != null,
  });
}

export function useUserRoles(id: number | null) {
  return useQuery<number[]>({
    queryKey: ["users", id, "roles"],
    queryFn: async () => {
      try {
        const { data } = await api.get<Array<{ id: number }>>(
          `/api/v1/users/${id}/roles`,
        );
        return data.map((role) => role.id);
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          [404, 405].includes(err.response?.status ?? 0)
        ) {
          const { data } = await api.get<UserResponse>(`/api/v1/users/${id}`);
          if (data.roles && data.roles.length > 0) {
            return data.roles.map((role) => role.id);
          }
          if (data.role?.id != null) return [data.role.id];
          if (data.roleId != null) return [data.roleId];
          return [];
        }
        throw err;
      }
    },
    enabled: id != null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation<UserResponse, Error, UserRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<UserResponse>("/api/v1/users", body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation<UserResponse, Error, { id: number; body: UserRequest }>({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.put<UserResponse>(`/api/v1/users/${id}`, body);
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { id: number; roleIds: number[] }>({
    mutationFn: async ({ id, roleIds }) => {
      const body = { roleIds };
      try {
        const { data } = await api.put(`/api/v1/users/${id}/roles`, body);
        return data;
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          [404, 405].includes(err.response?.status ?? 0)
        ) {
          const { data } = await api.post(`/api/v1/users/${id}/roles`, body);
          return data;
        }
        throw err;
      }
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["users", id] });
      void queryClient.invalidateQueries({ queryKey: ["users", id, "roles"] });
    },
  });
}

export function useChangeUserPassword() {
  return useMutation<
    void,
    Error,
    { id: number; body: UserPasswordChangeRequest }
  >({
    mutationFn: async ({ id, body }) => {
      const payloadPrimary = {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
        confirmPassword: body.confirmPassword,
      };

      const fallbackPayload = {
        oldPassword: body.currentPassword,
        password: body.newPassword,
        confirmPassword: body.confirmPassword,
      };

      try {
        await api.put(`/api/v1/users/${id}/password`, payloadPrimary);
        return;
      } catch (errFirst) {
        if (
          axios.isAxiosError(errFirst) &&
          [404, 405].includes(errFirst.response?.status ?? 0)
        ) {
          try {
            await api.put(
              `/api/v1/users/${id}/change-password`,
              payloadPrimary,
            );
            return;
          } catch (errSecond) {
            if (
              axios.isAxiosError(errSecond) &&
              [404, 405].includes(errSecond.response?.status ?? 0)
            ) {
              await api.post(`/api/v1/users/${id}/password`, fallbackPayload);
              return;
            }
            throw errSecond;
          }
        }
        throw errFirst;
      }
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/users/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRolesCatalog() {
  return useQuery<PageResponse<RoleResponse>>({
    queryKey: ["roles", "catalog"],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<RoleResponse>>(
        "/api/v1/roles",
        {
          params: { page: 0, size: 500 },
        },
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
