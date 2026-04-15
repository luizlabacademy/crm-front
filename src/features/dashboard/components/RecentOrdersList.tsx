import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatShortDate } from "@/lib/utils/formatDate";
import {
  BOARD_COLUMNS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from "@/features/dashboard/constants/orderStatus";
import type { RecentOrder } from "@/features/dashboard/types/dashboardTypes";
import { SkeletonRow } from "@/components/shared/SkeletonRow";

interface RecentOrdersListProps {
  orders: RecentOrder[];
  isLoading?: boolean;
}

const MAX_VISIBLE_ORDERS = 8;

function StatusBadge({ status }: { status: string }) {
  const label = ORDER_STATUS_LABEL[status] ?? status;
  const colorClass = ORDER_STATUS_COLOR[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}

export function RecentOrdersList({
  orders,
  isLoading = false,
}: RecentOrdersListProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filtered =
    activeFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  const visibleOrders = filtered.slice(0, MAX_VISIBLE_ORDERS);

  return (
    <div className="rounded-xl border border-border/80 bg-card shadow-sm">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Ultimos Pedidos</h2>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
        >
          Ver mais
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 px-5 py-2.5 border-b border-border">
        {BOARD_COLUMNS.map((col) => (
          <button
            key={col.key}
            type="button"
            onClick={() => setActiveFilter(col.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeFilter === col.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {col.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="max-h-[34rem] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Pedido</th>
              <th className="px-4 py-2 font-medium">Cliente</th>
              <th className="px-4 py-2 font-medium">Detalhes</th>
              <th className="px-4 py-2 font-medium text-right">Valor</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={5} />
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              visibleOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => void navigate(`/orders/${order.id}`)}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <p className="font-mono text-xs text-muted-foreground">
                      {order.code}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatShortDate(order.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="max-w-[180px] truncate">
                      {order.customerName}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Itens: {order.itemsCount ?? "-"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums align-top whitespace-nowrap">
                    {formatCurrency(order.totalCents)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
