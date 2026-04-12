import { useNavigate } from "react-router";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatShortDate } from "@/lib/utils/formatDate";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from "@/features/dashboard/constants/orderStatus";
import type { RecentOrder } from "@/features/dashboard/types/dashboardTypes";

interface RecentOrdersListProps {
  orders: RecentOrder[];
  isLoading?: boolean;
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
        </td>
      ))}
    </tr>
  );
}

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

function PriorityBadge({ priority }: { priority?: RecentOrder["priority"] }) {
  if (!priority) return null;
  const className =
    priority === "high"
      ? "bg-red-100 text-red-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
    >
      {priority === "high" ? "Alta" : "Normal"}
    </span>
  );
}

export function RecentOrdersList({
  orders,
  isLoading = false,
}: RecentOrdersListProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="px-5 pt-4 pb-3 border-b border-border">
        <h2 className="text-sm font-semibold">Últimos pedidos</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Cliente</th>
              <th className="px-4 py-2 font-medium">Itens</th>
              <th className="px-4 py-2 font-medium">Pagamento</th>
              <th className="px-4 py-2 font-medium text-right">Valor</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Prioridade</th>
              <th className="px-4 py-2 font-medium">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => void navigate(`/orders/${order.id}`)}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {order.code}
                  </td>
                  <td className="px-4 py-3 max-w-[140px] truncate">
                    {order.customerName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {order.itemsCount ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {order.paymentMethod ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(order.totalCents)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={order.priority} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatShortDate(order.createdAt)}
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
