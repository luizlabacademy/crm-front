import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  UploadResponse,
  UploadRulesResponse,
  UploadFileParams,
  UploadFileType,
  UploadPatchRequest,
} from "@/features/uploads/types/uploadTypes";

// ─── Rules ────────────────────────────────────────────────────────────────────

export function useUploadRules() {
  return useQuery<UploadRulesResponse>({
    queryKey: ["upload-rules"],
    queryFn: async () => {
      const { data } = await api.get<UploadRulesResponse>(
        "/api/v1/uploads/rules",
      );
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ─── List by entity ───────────────────────────────────────────────────────────

interface UseUploadsParams {
  fileType: UploadFileType;
  entityId: number;
  enabled?: boolean;
}

export function useUploads({ fileType, entityId, enabled = true }: UseUploadsParams) {
  return useQuery<UploadResponse[]>({
    queryKey: ["uploads", fileType, entityId],
    queryFn: async () => {
      const { data } = await api.get<UploadResponse[]>("/api/v1/uploads", {
        params: { fileType, entityId },
      });
      return data;
    },
    enabled: enabled && entityId > 0,
  });
}

// ─── List by fileType only (no entityId filter) ──────────────────────────────

interface UseUploadsByTypeParams {
  fileType: UploadFileType;
  enabled?: boolean;
}

export function useUploadsByType({
  fileType,
  enabled = true,
}: UseUploadsByTypeParams) {
  return useQuery<UploadResponse[]>({
    queryKey: ["uploads", "by-type", fileType],
    queryFn: async () => {
      const { data } = await api.get<UploadResponse[]>("/api/v1/uploads", {
        params: { fileType },
      });
      return data;
    },
    enabled,
  });
}

// ─── Get by ID ────────────────────────────────────────────────────────────────

export function useUpload(id: string | null) {
  return useQuery<UploadResponse>({
    queryKey: ["uploads", id],
    queryFn: async () => {
      const { data } = await api.get<UploadResponse>(`/api/v1/uploads/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ─── Delete upload ─────────────────────────────────────────────────────────────

export function useDeleteUpload() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; fileType?: UploadFileType; entityId?: number }>(
    {
      mutationFn: async ({ id }) => {
        await api.delete(`/api/v1/uploads/${id}`);
      },
      onSuccess: (_data, params) => {
        if (params.fileType && params.entityId != null) {
          void queryClient.invalidateQueries({
            queryKey: ["uploads", params.fileType, params.entityId],
          });
        }

        if (params.fileType) {
          void queryClient.invalidateQueries({
            queryKey: ["uploads", "by-type", params.fileType],
          });
        } else {
          void queryClient.invalidateQueries({ queryKey: ["uploads"] });
        }
      },
    },
  );
}

// ─── Patch upload ──────────────────────────────────────────────────────────────

export function usePatchUpload() {
  const queryClient = useQueryClient();

  return useMutation<
    UploadResponse,
    Error,
    { id: string; body: UploadPatchRequest; fileType?: UploadFileType; entityId?: number }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.patch<UploadResponse>(`/api/v1/uploads/${id}`, body);
      return data;
    },
    onSuccess: (_data, params) => {
      if (params.fileType && params.entityId != null) {
        void queryClient.invalidateQueries({
          queryKey: ["uploads", params.fileType, params.entityId],
        });
      }

      if (params.fileType) {
        void queryClient.invalidateQueries({
          queryKey: ["uploads", "by-type", params.fileType],
        });
      } else {
        void queryClient.invalidateQueries({ queryKey: ["uploads"] });
      }
    },
  });
}

// ─── Upload file ──────────────────────────────────────────────────────────────

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation<UploadResponse, Error, UploadFileParams>({
    mutationFn: async (params) => {
      const formData = new FormData();
      formData.append("file", params.file);

      const { data } = await api.post<UploadResponse>(
        "/api/v1/uploads",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          params: {
            fileType: params.fileType,
            tenantId: params.tenantId,
            entityId: params.entityId,
            ...(params.width != null ? { width: params.width } : {}),
            ...(params.height != null ? { height: params.height } : {}),
            ...(params.quality != null ? { quality: params.quality } : {}),
            ...(params.legend != null ? { legend: params.legend } : {}),
            ...(params.sortOrder != null ? { sortOrder: params.sortOrder } : {}),
          },
        },
      );
      return data;
    },
    onSuccess: (_data, params) => {
      void queryClient.invalidateQueries({
        queryKey: ["uploads", params.fileType, params.entityId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["uploads", "by-type", params.fileType],
      });
    },
  });
}

// ─── Upload from URL (for external images like Unsplash) ──────────────────────

export function useUploadFromUrl() {
  const uploadFile = useUploadFile();

  async function uploadFromUrl(
    url: string,
    params: Omit<UploadFileParams, "file">,
  ): Promise<UploadResponse> {
    const response = await fetch(url);
    const blob = await response.blob();
    const extension = blob.type.split("/")[1] ?? "jpg";
    const file = new File([blob], `upload.${extension}`, { type: blob.type });
    return uploadFile.mutateAsync({ ...params, file });
  }

  return {
    uploadFromUrl,
    isPending: uploadFile.isPending,
  };
}

// ─── Copy upload (fetch source file, re-upload as new fileType) ───────────────

interface CopyUploadParams {
  source: UploadResponse;
  targetFileType: UploadFileType;
  tenantId: number;
  entityId: number;
  legend?: string;
  sortOrder?: number;
}

export function useCopyUpload() {
  const uploadFile = useUploadFile();

  async function copyUpload(params: CopyUploadParams): Promise<UploadResponse> {
    const sourceUrl = params.source.viewUrl
      ? params.source.viewUrl
      : `${import.meta.env.VITE_API_BASE_URL ?? ""}/api/v1/uploads/${params.source.id}/view`;

    const token = localStorage.getItem("crm_token");
    const response = await fetch(sourceUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) {
      throw new Error(`Falha ao baixar arquivo de origem (${response.status})`);
    }
    const blob = await response.blob();
    const contentType =
      params.source.contentType || blob.type || "application/octet-stream";
    const fileName =
      params.source.fileName || `slide-${params.source.id}`;
    const file = new File([blob], fileName, { type: contentType });

    return uploadFile.mutateAsync({
      file,
      fileType: params.targetFileType,
      tenantId: params.tenantId,
      entityId: params.entityId,
      legend: params.legend,
      sortOrder: params.sortOrder,
    });
  }

  return {
    copyUpload,
    isPending: uploadFile.isPending,
  };
}
