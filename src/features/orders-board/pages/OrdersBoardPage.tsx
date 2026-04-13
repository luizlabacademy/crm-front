import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router";
import { GripVertical, Package, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatShortDate } from "@/lib/utils/formatDate";
import {
  BOARD_COLUMNS,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
} from "@/features/dashboard/constants/orderStatus";
import type { OrderStatus } from "@/features/dashboard/constants/orderStatus";
import type { RecentOrder } from "@/features/dashboard/types/dashboardTypes";
import ordersData from "@/features/dashboard/mocks/recent-orders.json";
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLUMN_STATUSES = BOARD_COLUMNS.filter((c) => c.key !== "ALL") as {
  key: OrderStatus;
  label: string;
}[];

const COLUMN_HEADER_COLORS: Record<string, string> = {
  NEW: "border-t-blue-500",
  AWAITING_PAYMENT: "border-t-yellow-500",
  PREPARING: "border-t-orange-500",
  READY_FOR_DELIVERY: "border-t-emerald-500",
  DELIVERED: "border-t-green-500",
};

// ─── Sortable Card ────────────────────────────────────────────────────────────

function SortableOrderCard({ order }: { order: RecentOrder }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/20",
      )}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">
              {order.code}
            </span>
            {order.priority === "high" && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                Alta
              </span>
            )}
          </div>

          {/* Customer */}
          <p className="truncate text-sm font-medium leading-tight">
            {order.customerName}
          </p>

          {/* Amount + items */}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {formatCurrency(order.totalCents)}
            </span>
            <span>
              {order.itemsCount ?? 0}{" "}
              {(order.itemsCount ?? 0) === 1 ? "item" : "itens"}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">
              {order.paymentMethod ?? "-"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatShortDate(order.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Static card used in the DragOverlay (no sortable hooks). */
function OrderCardOverlay({ order }: { order: RecentOrder }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-card p-3 shadow-xl ring-2 ring-primary/20 w-72">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground/40">
          <GripVertical size={14} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">
              {order.code}
            </span>
            {order.priority === "high" && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                Alta
              </span>
            )}
          </div>
          <p className="truncate text-sm font-medium leading-tight">
            {order.customerName}
          </p>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {formatCurrency(order.totalCents)}
            </span>
            <span>
              {order.itemsCount ?? 0}{" "}
              {(order.itemsCount ?? 0) === 1 ? "item" : "itens"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Board Column ─────────────────────────────────────────────────────────────

function BoardColumn({
  status,
  label,
  orders,
}: {
  status: string;
  label: string;
  orders: RecentOrder[];
}) {
  const ids = orders.map((o) => o.id);

  return (
    <div
      className={cn(
        "flex min-w-[280px] flex-col rounded-xl border border-border/80 bg-muted/30 border-t-4",
        COLUMN_HEADER_COLORS[status] ?? "border-t-gray-400",
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              ORDER_STATUS_COLOR[status] ?? "bg-gray-100 text-gray-700",
            )}
          >
            {ORDER_STATUS_LABEL[status] ?? label}
          </span>
        </div>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 overflow-y-auto p-3 min-h-[120px]">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package size={24} className="text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">Nenhum pedido</p>
            </div>
          ) : (
            orders.map((order) => (
              <SortableOrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OrdersBoardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RecentOrder[]>(
    ordersData as RecentOrder[],
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Group orders by status
  const columnData = useMemo(() => {
    const grouped: Record<string, RecentOrder[]> = {};
    for (const col of COLUMN_STATUSES) {
      grouped[col.key] = [];
    }
    for (const order of orders) {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    }
    return grouped;
  }, [orders]);

  const activeOrder = activeId
    ? (orders.find((o) => o.id === activeId) ?? null)
    : null;

  /** Find which column (status) contains the given order id. */
  function findColumn(id: string): string | undefined {
    // Is it a column id (status)?
    if (columnData[id]) return id;
    // Otherwise find the order
    const order = orders.find((o) => o.id === id);
    return order?.status;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeCol = findColumn(active.id as string);
    const overCol = findColumn(over.id as string);

    if (!activeCol || !overCol || activeCol === overCol) return;

    // Move order to new column
    setOrders((prev) =>
      prev.map((o) => (o.id === active.id ? { ...o, status: overCol } : o)),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeCol = findColumn(active.id as string);
    const overCol = findColumn(over.id as string);

    if (!activeCol || !overCol) return;

    if (activeCol !== overCol) {
      // Move order to new column (already handled in dragOver for cross-column)
      setOrders((prev) =>
        prev.map((o) => (o.id === active.id ? { ...o, status: overCol } : o)),
      );
    }

    // Reorder within column
    if (activeCol === overCol && active.id !== over.id) {
      setOrders((prev) => {
        const colOrders = prev.filter((o) => o.status === activeCol);
        const others = prev.filter((o) => o.status !== activeCol);
        const oldIndex = colOrders.findIndex((o) => o.id === active.id);
        const newIndex = colOrders.findIndex((o) => o.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;

        const reordered = [...colOrders];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);
        return [...others, ...reordered];
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void navigate("/dashboard")}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Quadro de Pedidos</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Arraste os pedidos entre colunas para atualizar o status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums font-medium">
            {orders.length} pedidos
          </span>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-4">
            {COLUMN_STATUSES.map((col) => (
              <BoardColumn
                key={col.key}
                status={col.key}
                label={col.label}
                orders={columnData[col.key] ?? []}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeOrder ? <OrderCardOverlay order={activeOrder} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
