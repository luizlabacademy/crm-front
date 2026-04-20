import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  UploadResponse,
  UploadRulesResponse,
  UploadFileParams,
  UploadFileType,
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
          },
        },
      );
      return data;
    },
    onSuccess: (_data, params) => {
      void queryClient.invalidateQueries({
        queryKey: ["uploads", params.fileType, params.entityId],
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
