import type {
  FunnelData,
  ConversionPeriod,
  ConversionRateData,
} from "@/features/dashboard/types/dashboardTypes";

import funnelDataJson from "@/features/dashboard/mocks/funnel-data.json";
import conversionDayJson from "@/features/dashboard/mocks/conversion-rate-day.json";
import conversionMonthJson from "@/features/dashboard/mocks/conversion-rate-month.json";
import conversionYearJson from "@/features/dashboard/mocks/conversion-rate-year.json";

// ─── Funnel ──────────────────────────────────────────────────────────────────

/**
 * Returns funnel data.
 * Currently reads from a local JSON mock.
 * Replace the implementation body with an API call when ready.
 */
export async function getFunnelData(): Promise<FunnelData> {
  // Simulate network delay for realistic loading states
  return funnelDataJson as FunnelData;
}

// ─── Conversion rate ─────────────────────────────────────────────────────────

const conversionDataMap: Record<ConversionPeriod, ConversionRateData> = {
  daily: conversionDayJson as ConversionRateData,
  monthly: conversionMonthJson as ConversionRateData,
  yearly: conversionYearJson as ConversionRateData,
};

/**
 * Returns conversion rate data for the given period.
 * Currently reads from local JSON mocks.
 * Replace the implementation body with an API call when ready.
 */
export async function getConversionRateData(
  period: ConversionPeriod,
): Promise<ConversionRateData> {
  return conversionDataMap[period];
}
