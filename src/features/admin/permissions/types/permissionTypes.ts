// ─── Raw API types ────────────────────────────────────────────────────────────

export interface PermissionResponse {
  id: number;
  code: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
}

export interface PermissionRequest {
  code: string;
  description?: string | null;
  active: boolean;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export type { PageResponse } from "@/lib/types/personTypes";
