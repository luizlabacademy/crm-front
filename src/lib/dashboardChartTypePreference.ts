export const DASHBOARD_CHART_TYPE_STORAGE_KEY = "crm:dashboard:chart-type";

export const DASHBOARD_CHART_TYPE_OPTIONS = ["area", "line", "bar"] as const;

export type DashboardChartType = (typeof DASHBOARD_CHART_TYPE_OPTIONS)[number];

export const FALLBACK_DASHBOARD_CHART_TYPE: DashboardChartType = "area";

function isValidChartType(value: string): value is DashboardChartType {
  return DASHBOARD_CHART_TYPE_OPTIONS.includes(value as DashboardChartType);
}

export function getDefaultDashboardChartType(): DashboardChartType {
  if (typeof window === "undefined") return FALLBACK_DASHBOARD_CHART_TYPE;

  const raw = window.localStorage.getItem(DASHBOARD_CHART_TYPE_STORAGE_KEY);
  if (!raw || !isValidChartType(raw)) {
    return FALLBACK_DASHBOARD_CHART_TYPE;
  }

  return raw;
}

export function setDefaultDashboardChartType(value: DashboardChartType): void {
  if (typeof window === "undefined") return;
  if (!isValidChartType(value)) return;
  window.localStorage.setItem(DASHBOARD_CHART_TYPE_STORAGE_KEY, value);
}
