import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { isToday, isThisMonth, isThisYear, parseISO } from "date-fns";
import { ORDER_STATUS } from "@/features/dashboard/constants/orderStatus";
import {
  LEAD_ACTIVE_STATUSES,
  LEAD_CLOSED_STATUSES,
} from "@/features/dashboard/constants/leadStatus";
import type {
  ApiOrder,
  ApiLead,
  ApiLeadMessage,
  PageResponse,
  DashboardData,
  RecentMessage,
  RecentOrder,
} from "@/features/dashboard/types/dashboardTypes";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isClosed(status: string): boolean {
  return status === ORDER_STATUS.DELIVERED;
}

function isPending(status: string): boolean {
  return (
    status === ORDER_STATUS.NEW ||
    status === ORDER_STATUS.AWAITING_PAYMENT ||
    status === ORDER_STATUS.PREPARING ||
    status === ORDER_STATUS.READY_FOR_DELIVERY
  );
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchOrders(): Promise<ApiOrder[]> {
  const { data } = await api.get<PageResponse<ApiOrder>>("/api/v1/orders", {
    params: { sort: "createdAt,desc", size: 100 },
  });
  return data.content ?? [];
}

async function fetchLeads(): Promise<ApiLead[]> {
  const { data } = await api.get<PageResponse<ApiLead>>("/api/v1/leads", {
    params: { sort: "createdAt,desc", size: 50 },
  });
  return data.content ?? [];
}

async function fetchLeadMessages(leadId: string): Promise<ApiLeadMessage[]> {
  const { data } = await api.get<ApiLeadMessage[]>(
    `/api/v1/leads/${leadId}/messages`,
  );
  return Array.isArray(data) ? data : [];
}

// ─── Main processor ──────────────────────────────────────────────────────────

async function buildDashboardData(): Promise<DashboardData> {
  const [orders, leads] = await Promise.all([fetchOrders(), fetchLeads()]);

  // ── KPIs from orders ──────────────────────────────────────────────────────
  let revenueToday = 0;
  let revenueMonth = 0;
  let revenueYear = 0;
  let accountsPayable = 0;
  let newOrdersMonth = 0;
  let pendingOrders = 0;
  let closedOrdersMonth = 0;
  const activeCustomers = new Set<string>();

  for (const order of orders) {
    const date = parseISO(order.createdAt);
    const closed = isClosed(order.status);

    if (isPending(order.status)) {
      pendingOrders++;
      accountsPayable += order.totalCents;
    }

    if (isToday(date) && closed) revenueToday += order.totalCents;
    if (isThisMonth(date)) {
      newOrdersMonth++;
      const customerId = order.customer?.id?.trim();
      const customerName = order.customer?.name?.trim();
      if (customerId) {
        activeCustomers.add(`id:${customerId}`);
      } else if (customerName) {
        activeCustomers.add(`name:${customerName.toLowerCase()}`);
      }
      if (closed) {
        revenueMonth += order.totalCents;
        closedOrdersMonth++;
      }
    }
    if (isThisYear(date) && closed) revenueYear += order.totalCents;
  }

  // ── KPIs from leads ───────────────────────────────────────────────────────
  let activeLeads = 0;
  let closedLeadsMonth = 0;

  const activeLeadIds: string[] = [];

  for (const lead of leads) {
    const date = parseISO(lead.createdAt);
    if (LEAD_ACTIVE_STATUSES.includes(lead.status)) {
      activeLeads++;
      activeLeadIds.push(lead.id);
    }
    if (LEAD_CLOSED_STATUSES.includes(lead.status) && isThisMonth(date)) {
      closedLeadsMonth++;
    }
  }

  // ── Messages from up to 5 most-recent active leads ────────────────────────
  const topLeadIds = activeLeadIds.slice(0, 5);
  const messageArrays = await Promise.all(
    topLeadIds.map((id) => fetchLeadMessages(id).catch(() => [])),
  );

  const leadById = new Map(leads.map((l) => [l.id, l]));

  const allMessages: RecentMessage[] = messageArrays
    .flat()
    .filter((m) => isThisMonth(parseISO(m.createdAt)))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10)
    .map((m) => {
      const lead = leadById.get(m.leadId);
      return {
        id: m.id,
        leadId: m.leadId,
        customerName: lead?.customer?.name ?? "—",
        preview: truncate(m.content, 80),
        createdAt: m.createdAt,
      };
    });

  const newMessagesMonth = messageArrays
    .flat()
    .filter((m) => isThisMonth(parseISO(m.createdAt))).length;

  // ── Recent orders ─────────────────────────────────────────────────────────
  const recentOrders: RecentOrder[] = orders.slice(0, 10).map((o) => ({
    id: o.id,
    code: o.code ?? o.id,
    customerName: o.customer?.name ?? "—",
    totalCents: o.totalCents,
    status: o.status,
    createdAt: o.createdAt,
  }));

  return {
    kpis: {
      revenueToday,
      revenueMonth,
      revenueYear,
      accountsPayable,
      newOrdersMonth,
      pendingOrders,
      closedOrdersMonth,
      newMessagesMonth,
      activeLeads,
      closedLeadsMonth,
      activeCustomers: activeCustomers.size,
    },
    recentMessages: allMessages,
    recentOrders,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: buildDashboardData,
    staleTime: 5 * 60 * 1000,
  });
}
