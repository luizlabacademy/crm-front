// ─── Lead ─────────────────────────────────────────────────────────────────────

export interface LeadResponse {
  id: number;
  tenantId: number;
  flowId: number;
  customerId?: number | null;
  status: string;
  source?: string | null;
  estimatedValueCents?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface LeadRequest {
  tenantId: number;
  flowId: number;
  customerId?: number | null;
  status: string;
  source?: string | null;
  estimatedValueCents?: number | null;
  notes?: string | null;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface LeadMessageResponse {
  id: number;
  leadId: number;
  message: string;
  channel?: string | null;
  createdByUserId?: number | null;
  createdAt: string;
}

export interface LeadMessageRequest {
  message: string;
  channel?: string | null;
  createdByUserId?: number | null;
}

// ─── Pipeline flow ────────────────────────────────────────────────────────────

export interface PipelineStepResponse {
  id: number;
  code: string;
  name: string;
  order: number;
}

export interface PipelineFlowResponse {
  id: number;
  tenantId: number;
  name: string;
  steps: PipelineStepResponse[];
}

// ─── Status colors ────────────────────────────────────────────────────────────

export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
};

// ─── Shared ───────────────────────────────────────────────────────────────────

export type { PageResponse } from "@/lib/types/personTypes";
