import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  LeadResponse,
  LeadRequest,
  LeadMessageResponse,
  LeadMessageRequest,
  PipelineFlowResponse,
  PageResponse,
} from "@/features/leads/types/leadTypes";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UseLeadsParams {
  page?: number;
  size?: number;
  tenantId?: number | null;
}

export function useLeads(params: UseLeadsParams = {}) {
  const { page = 0, size = 20, tenantId } = params;
  return useQuery<PageResponse<LeadResponse>>({
    queryKey: ["leads", { page, size, tenantId }],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<LeadResponse>>(
        "/api/v1/leads",
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

export function useLead(id: number | null) {
  return useQuery<LeadResponse>({
    queryKey: ["leads", id],
    queryFn: async () => {
      const { data } = await api.get<LeadResponse>(`/api/v1/leads/${id}`);
      return data;
    },
    enabled: id != null,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation<LeadResponse, Error, LeadRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<LeadResponse>("/api/v1/leads", body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation<LeadResponse, Error, { id: number; body: LeadRequest }>({
    mutationFn: async ({ id, body }) => {
      const { data } = await api.put<LeadResponse>(`/api/v1/leads/${id}`, body);
      return data;
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void queryClient.invalidateQueries({ queryKey: ["leads", id] });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/leads/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function useLeadMessages(leadId: number | null) {
  return useQuery<LeadMessageResponse[]>({
    queryKey: ["lead-messages", leadId],
    queryFn: async () => {
      const { data } = await api.get<LeadMessageResponse[]>(
        `/api/v1/leads/${leadId}/messages`,
      );
      return data;
    },
    enabled: leadId != null,
  });
}

export function useSendLeadMessage() {
  const queryClient = useQueryClient();
  return useMutation<
    LeadMessageResponse,
    Error,
    { leadId: number; body: LeadMessageRequest }
  >({
    mutationFn: async ({ leadId, body }) => {
      const { data } = await api.post<LeadMessageResponse>(
        `/api/v1/leads/${leadId}/messages`,
        body,
      );
      return data;
    },
    onSuccess: (_data, { leadId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["lead-messages", leadId],
      });
    },
  });
}

// ─── Pipeline flows ───────────────────────────────────────────────────────────

export function usePipelineFlows(tenantId?: number | null) {
  return useQuery<PipelineFlowResponse[]>({
    queryKey: ["pipeline-flows", tenantId],
    queryFn: async () => {
      const { data } = await api.get<PipelineFlowResponse[]>(
        "/api/v1/pipeline-flows",
        {
          params: tenantId != null ? { tenantId } : {},
        },
      );
      return Array.isArray(data)
        ? data
        : ((data as { content?: PipelineFlowResponse[] }).content ?? []);
    },
    enabled: true,
    staleTime: 2 * 60 * 1000,
  });
}
