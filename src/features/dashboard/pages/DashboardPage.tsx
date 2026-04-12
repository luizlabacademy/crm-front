import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  BanknoteArrowUp,
  HandCoins,
  CheckCircle2,
  CircleAlert,
  MessageSquare,
  RefreshCw,
  ShoppingCart,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getRecentMessagesData,
  getRecentOrdersData,
} from "@/features/dashboard/api/dashboardMockService";
import { useDashboardData } from "@/features/dashboard/api/useDashboardData";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { FunnelPanel } from "@/features/dashboard/components/FunnelPanel";
import { ConversionRateChart } from "@/features/dashboard/components/ConversionRateChart";
import { RecentMessagesList } from "@/features/dashboard/components/RecentMessagesList";
import { RecentOrdersList } from "@/features/dashboard/components/RecentOrdersList";
import type {
  DashboardKpi,
  RecentMessage,
  RecentOrder,
} from "@/features/dashboard/types/dashboardTypes";
import type { LucideIcon } from "lucide-react";

// ─── KPI definitions ──────────────────────────────────────────────────────────

interface KpiDef {
  label: string;
  key: keyof DashboardKpi;
  type: "currency" | "count";
  icon: LucideIcon;
  storageKey: string;
}

const REVENUE_KPI_DEFS: KpiDef[] = [
  {
    label: "Vendas Hoje",
    key: "revenueToday",
    type: "currency",
    icon: HandCoins,
    storageKey: "rev_today",
  },
  {
    label: "Vendas Mês",
    key: "revenueMonth",
    type: "currency",
    icon: BadgeDollarSign,
    storageKey: "rev_month",
  },
  {
    label: "Vendas Ano",
    key: "revenueYear",
    type: "currency",
    icon: BanknoteArrowUp,
    storageKey: "rev_year",
  },
];

const SECONDARY_KPI_DEFS: KpiDef[] = [
  {
    label: "Novos Pedidos",
    key: "newOrdersMonth",
    type: "count",
    icon: ShoppingCart,
    storageKey: "orders_new",
  },
  {
    label: "Com Pendências",
    key: "pendingOrders",
    type: "count",
    icon: CircleAlert,
    storageKey: "orders_pending",
  },
  {
    label: "Novas Mensagens",
    key: "newMessagesMonth",
    type: "count",
    icon: MessageSquare,
    storageKey: "msgs_month",
  },
  {
    label: "Chats Abertos",
    key: "activeLeads",
    type: "count",
    icon: MessageCircle,
    storageKey: "leads_active",
  },
  {
    label: "Chats Concluídos",
    key: "closedLeadsMonth",
    type: "count",
    icon: CheckCircle2,
    storageKey: "leads_closed",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboardData();
  const [mockMessages, setMockMessages] = useState<RecentMessage[]>([]);
  const [mockOrders, setMockOrders] = useState<RecentOrder[]>([]);
  const [isLoadingMocks, setIsLoadingMocks] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingMocks(true);
    Promise.all([getRecentMessagesData(), getRecentOrdersData()])
      .then(([messages, orders]) => {
        if (cancelled) return;
        setMockMessages(messages);
        setMockOrders(orders);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMocks(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleRefresh() {
    void refetch().then(({ isError: err }) => {
      if (err) {
        toast.error("Erro ao atualizar o dashboard. Verifique sua conexão.");
      }
    });
  }

  const kpis = data?.kpis;
  const recentMessages = mockMessages;
  const recentOrders = mockOrders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visão geral do negócio
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isFetching}
          aria-label="Atualizar dados"
          className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {/* Total error state */}
      {isError && !isLoading && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-4">
          <span>Erro ao carregar o dashboard. Verifique sua conexão.</span>
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 underline underline-offset-2 hover:no-underline text-sm"
          >
            <RefreshCw size={12} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Revenue KPIs — 3 columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REVENUE_KPI_DEFS.map((def) => (
          <KpiCard
            key={def.storageKey}
            label={def.label}
            value={kpis?.[def.key] ?? 0}
            type={def.type}
            icon={def.icon}
            variant="large"
            isLoading={isLoading}
            isError={isError && !isLoading}
            onRetry={handleRefresh}
            storageKey={def.storageKey}
          />
        ))}
      </div>

      {/* Secondary KPIs — last 4 in a single row on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SECONDARY_KPI_DEFS.map((def) => (
          <KpiCard
            key={def.storageKey}
            label={def.label}
            value={kpis?.[def.key] ?? 0}
            type={def.type}
            icon={def.icon}
            variant="compact"
            isLoading={isLoading}
            isError={isError && !isLoading}
            onRetry={handleRefresh}
            storageKey={def.storageKey}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Funnel & Conversion panels — 2 columns on large */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FunnelPanel />
        <ConversionRateChart />
      </div>

      {/* Recent activity — 2 columns on large */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentMessagesList
          messages={recentMessages}
          isLoading={isLoadingMocks}
        />
        <RecentOrdersList orders={recentOrders} isLoading={isLoadingMocks} />
      </div>
    </div>
  );
}
