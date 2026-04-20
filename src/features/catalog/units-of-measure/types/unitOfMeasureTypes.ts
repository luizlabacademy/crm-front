export interface UnitOfMeasureResponse {
  id: number;
  code: string;
  name: string;
  symbol: string | null;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export type { PageResponse } from "@/lib/types/personTypes";
