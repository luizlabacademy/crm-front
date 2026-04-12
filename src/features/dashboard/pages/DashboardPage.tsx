import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useDashboardData } from "@/features/dashboard/api/useDashboardData";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { RecentMessagesList } from "@/features/dashboard/components/RecentMessagesList";
import { RecentOrdersList } from "@/features/dashboard/components/RecentOrdersList";
import type { DashboardKpi } from "@/features/dashboard/types/dashboardTypes";

// ─── KPI definitions ──────────────────────────────────────────────────────────

interface KpiDef {
  label: string;
  key: keyof DashboardKpi;
  type: "currency" | "count";
  storageKey: string;
}

const KPI_DEFS: KpiDef[] = [
  {
    label: "Faturamento do dia",
    key: "revenueToday",
    type: "currency",
    storageKey: "rev_today",
  },
  {
    label: "Faturamento do mês",
    key: "revenueMonth",
    type: "currency",
    storageKey: "rev_month",
  },
  {
    label: "Faturamento do ano",
    key: "revenueYear",
    type: "currency",
    storageKey: "rev_year",
  },
  {
    label: "Novos pedidos (mês)",
    key: "newOrdersMonth",
    type: "count",
    storageKey: "orders_new",
  },
  {
    label: "Pedidos pendentes",
    key: "pendingOrders",
    type: "count",
    storageKey: "orders_pending",
  },
  {
    label: "Pedidos fechados (mês)",
    key: "closedOrdersMonth",
    type: "count",
    storageKey: "orders_closed",
  },
  {
    label: "Novas mensagens (mês)",
    key: "newMessagesMonth",
    type: "count",
    storageKey: "msgs_month",
  },
  {
    label: "Atendimentos em curso",
    key: "activeLeads",
    type: "count",
    storageKey: "leads_active",
  },
  {
    label: "Atendimentos concluídos (mês)",
    key: "closedLeadsMonth",
    type: "count",
    storageKey: "leads_closed",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboardData();

  function handleRefresh() {
    void refetch().then(({ isError: err }) => {
      if (err) {
        toast.error("Erro ao atualizar o dashboard. Verifique sua conexão.");
      }
    });
  }

  const kpis = data?.kpis;
  const recentMessages = data?.recentMessages ?? [];
  const recentOrders = data?.recentOrders ?? [];

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

      {/* KPI Grid — 3 columns on large, 2 on sm, 1 on mobile */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KPI_DEFS.map((def) => (
          <KpiCard
            key={def.storageKey}
            label={def.label}
            value={kpis?.[def.key] ?? 0}
            type={def.type}
            isLoading={isLoading}
            isError={isError && !isLoading}
            onRetry={handleRefresh}
            storageKey={def.storageKey}
          />
        ))}
      </div>

      {/* Recent activity — 2 columns on large */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentMessagesList messages={recentMessages} isLoading={isLoading} />
        <RecentOrdersList orders={recentOrders} isLoading={isLoading} />
      </div>
    </div>
  );
}
