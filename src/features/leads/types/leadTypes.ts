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

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
