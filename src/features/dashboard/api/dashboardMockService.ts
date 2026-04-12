import type {
  FunnelData,
  FunnelPeriod,
  ConversionPeriod,
  ConversionRateData,
  RecentMessage,
  RecentOrder,
} from "@/features/dashboard/types/dashboardTypes";

import funnel30dJson from "@/features/dashboard/mocks/funnel-30d.json";
import funnel60dJson from "@/features/dashboard/mocks/funnel-60d.json";
import funnel90dJson from "@/features/dashboard/mocks/funnel-90d.json";
import funnel180dJson from "@/features/dashboard/mocks/funnel-180d.json";
import funnel1yJson from "@/features/dashboard/mocks/funnel-1y.json";
import funnel2yJson from "@/features/dashboard/mocks/funnel-2y.json";
import funnel5yJson from "@/features/dashboard/mocks/funnel-5y.json";
import funnelAllJson from "@/features/dashboard/mocks/funnel-all.json";
import conversionDayJson from "@/features/dashboard/mocks/conversion-rate-day.json";
import conversionMonthJson from "@/features/dashboard/mocks/conversion-rate-month.json";
import conversionYearJson from "@/features/dashboard/mocks/conversion-rate-year.json";
import recentMessagesJson from "@/features/dashboard/mocks/recent-messages.json";
import recentOrdersJson from "@/features/dashboard/mocks/recent-orders.json";

// ─── Funnel ──────────────────────────────────────────────────────────────────

const funnelDataMap: Record<FunnelPeriod, FunnelData> = {
  "30d": funnel30dJson as FunnelData,
  "60d": funnel60dJson as FunnelData,
  "90d": funnel90dJson as FunnelData,
  "180d": funnel180dJson as FunnelData,
  "1y": funnel1yJson as FunnelData,
  "2y": funnel2yJson as FunnelData,
  "5y": funnel5yJson as FunnelData,
  all: funnelAllJson as FunnelData,
};

export async function getFunnelData(period: FunnelPeriod): Promise<FunnelData> {
  return funnelDataMap[period];
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

export async function getRecentMessagesData(): Promise<RecentMessage[]> {
  return recentMessagesJson as RecentMessage[];
}

export async function getRecentOrdersData(): Promise<RecentOrder[]> {
  return recentOrdersJson as RecentOrder[];
}
