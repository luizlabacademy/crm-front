// ─── Item ─────────────────────────────────────────────────────────────────────

export type ItemType = "PRODUCT" | "SERVICE";

// ─── Datasheets ───────────────────────────────────────────────────────────────

export interface ProductDatasheetRequest {
  description?: string | null;
  unitPriceCents?: number | null;
  currencyCode?: string | null;
  unitOfMeasureId?: number | null;
  weightKg?: number | null;
  volumeM3?: number | null;
  densityKgM3?: number | null;
  heightCm?: number | null;
  widthCm?: number | null;
  lengthCm?: number | null;
}

export interface ProductDatasheetResponse extends ProductDatasheetRequest {
  id?: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface ServiceDatasheetRequest {
  description?: string | null;
  unitPriceCents?: number | null;
  currencyCode?: string | null;
  durationMinutes?: number | null;
  requiresStaff?: boolean | null;
  bufferMinutes?: number | null;
}

export interface ServiceDatasheetResponse extends ServiceDatasheetRequest {
  id?: number;
  createdAt?: string;
  updatedAt?: string | null;
}

// ─── Options & Additionals ────────────────────────────────────────────────────

export interface OptionRequest {
  name: string;
  priceDeltaCents?: number | null;
  active: boolean;
}

export interface OptionResponse {
  id: number;
  name: string;
  priceDeltaCents?: number | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface AdditionalRequest {
  name: string;
  priceCents?: number | null;
  active: boolean;
}

export interface AdditionalResponse {
  id: number;
  name: string;
  priceCents?: number | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

// ─── Item Request/Response ────────────────────────────────────────────────────

export interface ItemRequest {
  tenantId: number;
  categoryId?: number | null;
  type: ItemType;
  name: string;
  sku?: string | null;
  productDatasheet?: ProductDatasheetRequest | null;
  serviceDatasheet?: ServiceDatasheetRequest | null;
  tags?: string[];
  options?: OptionRequest[];
  additionals?: AdditionalRequest[];
  active: boolean;
}

/** Response used for GET /items/{id} — full detail */
export interface ItemResponse {
  id: number;
  code?: string | null;
  tenantId: number;
  categoryId?: number | null;
  type: ItemType;
  name: string;
  sku?: string | null;
  photos?: string[];
  productDatasheet?: ProductDatasheetResponse | null;
  serviceDatasheet?: ServiceDatasheetResponse | null;
  tags?: string[];
  options?: OptionResponse[];
  additionals?: AdditionalResponse[];
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
  // Enriched client-side
  categoryName?: string | null;
  category?: ItemCategoryRelation | null;
}

/** Response used for GET /items (list) — lighter, no datasheets */
export interface ItemListResponse {
  id: number;
  code?: string | null;
  tenantId: number;
  categoryId?: number | null;
  type: ItemType;
  name: string;
  sku?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
  // Enriched client-side
  categoryName?: string | null;
  category?: ItemCategoryRelation | null;
}

export interface ItemCategoryRelation {
  id: number;
  tenantId?: number;
  name: string;
  photo?: string | null;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export type { PageResponse } from "@/lib/types/personTypes";
