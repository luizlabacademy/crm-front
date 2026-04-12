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
}

export interface RecentOrder {
  id: string;
  code: string;
  customerName: string;
  totalCents: number;
  status: string;
  createdAt: string;
}

export interface DashboardData {
  kpis: DashboardKpi;
  recentMessages: RecentMessage[];
  recentOrders: RecentOrder[];
}
