import type { ConversionPeriod } from "@/features/dashboard/types/dashboardTypes";
import type { DashboardChartType } from "@/lib/dashboardChartTypePreference";

export type ChartMode =
  | "sales"
  | "expenses"
  | "leads"
  | "conversion"
  | "newCustomers"
  | "activeCustomers"
  | "servicesCompleted";

export const CHART_MODE_OPTIONS: { value: ChartMode; label: string }[] = [
  { value: "sales", label: "Vendas" },
  { value: "expenses", label: "Despesas" },
  { value: "leads", label: "Leads" },
  { value: "conversion", label: "Conversão" },
  { value: "newCustomers", label: "Novos Clientes" },
  { value: "activeCustomers", label: "Clientes Ativos" },
  { value: "servicesCompleted", label: "Atendimentos" },
];

export const PERIOD_OPTIONS: { value: ConversionPeriod; label: string }[] = [
  { value: "daily", label: "Diária" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
];

export const CHART_VIEW_OPTIONS: { value: DashboardChartType; label: string }[] =
  [
    { value: "area", label: "Area" },
    { value: "line", label: "Linhas" },
    { value: "bar", label: "Barras" },
  ];

export const MONTH_SEASONALITY = [
  0.92, 0.88, 0.96, 1.02, 1.04, 1.0, 0.98, 1.06, 1.01, 1.05, 1.14, 1.2,
];

export const MONTH_LABELS_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export const MONTH_LABELS_LONG = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export interface ModeProfile {
  dailyBase: number;
  monthlyBase: number;
  yearlyBase: number;
  volatility: number;
  growth: number;
  seasonality: number;
}

export const MODE_PROFILES: Record<ChartMode, ModeProfile> = {
  sales: {
    dailyBase: 11500,
    monthlyBase: 260000,
    yearlyBase: 3100000,
    volatility: 0.12,
    growth: 0.05,
    seasonality: 0.12,
  },
  expenses: {
    dailyBase: 5200,
    monthlyBase: 125000,
    yearlyBase: 1500000,
    volatility: 0.09,
    growth: 0.038,
    seasonality: 0.08,
  },
  leads: {
    dailyBase: 38,
    monthlyBase: 940,
    yearlyBase: 11200,
    volatility: 0.14,
    growth: 0.045,
    seasonality: 0.14,
  },
  conversion: {
    dailyBase: 18,
    monthlyBase: 19,
    yearlyBase: 20,
    volatility: 0.08,
    growth: 0.012,
    seasonality: 0.08,
  },
  newCustomers: {
    dailyBase: 15,
    monthlyBase: 340,
    yearlyBase: 3900,
    volatility: 0.12,
    growth: 0.05,
    seasonality: 0.1,
  },
  activeCustomers: {
    dailyBase: 88,
    monthlyBase: 1850,
    yearlyBase: 20500,
    volatility: 0.07,
    growth: 0.042,
    seasonality: 0.05,
  },
  servicesCompleted: {
    dailyBase: 64,
    monthlyBase: 1450,
    yearlyBase: 17000,
    volatility: 0.1,
    growth: 0.047,
    seasonality: 0.09,
  },
};

export const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const countFormatter = new Intl.NumberFormat("pt-BR");

export const DASHBOARD_PERIOD_STORAGE_KEY = "dashboard_conversion_period";
