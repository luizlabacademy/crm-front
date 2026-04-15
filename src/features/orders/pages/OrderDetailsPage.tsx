import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useOrder, useDeleteOrder } from "@/features/orders/api/useOrders";
import { ORDER_STATUS_COLORS } from "@/features/orders/types/orderTypes";
import { formatDateTime } from "@/lib/utils/formatDate";
import { formatCurrencyCode } from "@/lib/utils/formatCurrency";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : null;

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: order, isLoading, isError } = useOrder(orderId);
  const deleteMutation = useDeleteOrder();

  async function handleDelete() {
    if (!orderId) return;
    try {
      await deleteMutation.mutateAsync(orderId);
      toast.success("Pedido excluído com sucesso.");
      void navigate("/orders");
    } catch {
      toast.error("Erro ao excluir pedido. Tente novamente.");
      setShowDeleteModal(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-3xl">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-full animate-pulse rounded bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-2xl font-semibold">Pedido não encontrado</h1>
        <p className="text-muted-foreground">
          O pedido solicitado não existe ou não está disponível.
        </p>
        <button
          type="button"
          onClick={() => void navigate("/orders")}
          className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar à listagem
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void navigate("/orders")}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Pedido #{order.id}</h1>
            {order.code && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {order.code}
              </p>
            )}
          </div>
          <StatusBadge status={order.status} colorMap={ORDER_STATUS_COLORS} />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void navigate(`/orders/${order.id}/edit`)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Pencil size={13} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-3 py-1.5 text-sm hover:bg-destructive/20 transition-colors"
          >
            <Trash2 size={13} />
            Excluir
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dados do pedido
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Cliente</dt>
            <dd className="font-medium">
              <Link
                to={`/customers/${order.customerId}`}
                className="text-primary hover:underline"
              >
                #{order.customerId}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Responsável</dt>
            <dd className="font-medium">#{order.userId}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Moeda</dt>
            <dd className="font-medium">{order.currencyCode}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Criado em</dt>
            <dd className="font-medium">{formatDateTime(order.createdAt)}</dd>
          </div>
          {order.updatedAt && (
            <div>
              <dt className="text-muted-foreground">Atualizado em</dt>
              <dd className="font-medium">{formatDateTime(order.updatedAt)}</dd>
            </div>
          )}
          {order.notes && (
            <div className="col-span-2">
              <dt className="text-muted-foreground">Notas</dt>
              <dd className="font-medium whitespace-pre-wrap">{order.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Items table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">
            Itens do pedido ({order.items.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground bg-muted/40">
                <th className="px-4 py-3 font-medium">Item ID</th>
                <th className="px-4 py-3 font-medium">Quantidade</th>
                <th className="px-4 py-3 font-medium">Preço unitário</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum item neste pedido.
                  </td>
                </tr>
              ) : (
                order.items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-accent/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      #{item.itemId}
                    </td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {formatCurrencyCode(
                        item.unitPriceCents,
                        order.currencyCode,
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-right font-medium">
                      {formatCurrencyCode(
                        item.totalPriceCents,
                        order.currencyCode,
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Financial footer */}
        <div className="border-t border-border px-5 py-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono">
              {formatCurrencyCode(order.subtotalCents, order.currencyCode)}
            </span>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Desconto</span>
              <span className="font-mono">
                - {formatCurrencyCode(order.discountCents, order.currencyCode)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t border-border pt-1.5">
            <span>Total</span>
            <span className="font-mono">
              {formatCurrencyCode(order.totalCents, order.currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <ConfirmDeleteModal
          description="Deseja excluir este pedido? Esta ação não pode ser desfeita."
          onConfirm={() => void handleDelete()}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
