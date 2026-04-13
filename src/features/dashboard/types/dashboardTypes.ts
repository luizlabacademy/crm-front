// ─── Raw API response types ──────────────────────────────────────────────────

export interface ApiOrder {
  id: string;
  code?: string;
  status: string;
  totalCents: number;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
  };
}

export interface ApiLead {
  id: string;
  status: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
  };
}

export interface ApiLeadMessage {
  id: string;
  leadId: string;
  content: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ─── Dashboard domain types ───────────────────────────────────────────────────

export interface DashboardKpi {
  /** centavos */
  revenueToday: number;
  /** centavos */
  revenueMonth: number;
  /** centavos */
  revenueYear: number;
  newOrdersMonth: number;
  pendingOrders: number;
  closedOrdersMonth: number;
  newMessagesMonth: number;
  activeLeads: number;
  closedLeadsMonth: number;
}

export interface RecentMessage {
  id: string;
  leadId: string;
  customerName: string;
  preview: string;
  createdAt: string;
  channel?: string;
  unreadCount?: number;
  sentiment?: "hot" | "warm" | "cold";
}

export interface RecentOrder {
  id: string;
  code: string;
  customerName: string;
  totalCents: number;
  status: string;
  createdAt: string;
  itemsCount?: number;
  paymentMethod?: string;
  priority?: "normal" | "medium" | "high" | "very_high";
}

export interface DashboardData {
  kpis: DashboardKpi;
  recentMessages: RecentMessage[];
  recentOrders: RecentOrder[];
}

// ─── Funnel types ─────────────────────────────────────────────────────────────

export interface FunnelStep {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface FunnelSummaryMetric {
  id: string;
  label: string;
  value: string;
  color?: string;
}

export interface FunnelData {
  steps: FunnelStep[];
  summary: FunnelSummaryMetric[];
}

export type FunnelPeriod =
  | "30d"
  | "60d"
  | "90d"
  | "180d"
  | "1y"
  | "2y"
  | "5y"
  | "all";

// ─── Conversion rate chart types ──────────────────────────────────────────────

export type ConversionPeriod = "daily" | "monthly" | "yearly";

export interface ConversionDataPoint {
  label: string;
  conversionRate: number;
}

export interface ConversionRateData {
  period: ConversionPeriod;
  data: ConversionDataPoint[];
}
