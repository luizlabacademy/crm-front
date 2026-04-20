export type UploadFileType =
  | "PRODUCT"
  | "SERVICE"
  | "CUSTOMER"
  | "WORKER"
  | "TENANT"
  | "USER"
  | "CATEGORY"
  | "SLIDE"
  | "SLIDE_SAAS"
  | "SLIDE_OWN"
  | "BANNER"
  | "OTHERS";

export interface UploadResponse {
  id: string;
  fileType: UploadFileType;
  entityId: number;
  tenantId: number;
  itemId?: number | null;
  categoryId?: number | null;
  customerId?: number | null;
  workerId?: number | null;
  fileName: string;
  filePath: string;
  contentType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  sortOrder?: number | null;
  legend?: string | null;
  viewUrl?: string | null;
  downloadUrl?: string | null;
  createdAt: string;
}

export interface FileTypeRuleResponse {
  fileType: UploadFileType;
  displayName: string;
  allowedExtensions: string[];
  maxSizeBytes: number;
  maxWidth?: number | null;
  maxHeight?: number | null;
}

export interface UploadRulesResponse {
  minQuality: number;
  maxQuality: number;
  rules: FileTypeRuleResponse[];
}

export interface UploadFileParams {
  file: File;
  fileType: UploadFileType;
  tenantId: number;
  entityId: number;
  width?: number;
  height?: number;
  quality?: number;
  legend?: string;
  sortOrder?: number;
}

// ─── Helper: build view URL from upload ───────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Returns the best URL to display an uploaded image.
 * Priority: viewUrl from API > constructed /uploads/{id}/view > filePath fallback.
 */
export function getUploadViewUrl(upload: UploadResponse): string {
  if (upload.viewUrl) return upload.viewUrl;
  return `${API_BASE}/api/v1/uploads/${upload.id}/view`;
}
