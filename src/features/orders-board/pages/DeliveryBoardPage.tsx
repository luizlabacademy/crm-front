import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router";
import { GripVertical, Truck, ArrowLeft, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatShortDate } from "@/lib/utils/formatDate";
import type { RecentOrder } from "@/features/dashboard/types/dashboardTypes";
import ordersData from "@/features/dashboard/mocks/recent-orders.json";
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";

// ─── Delivery Board Columns ───────────────────────────────────────────────────

type DeliveryStatus =
  | "WAITING_PREPARATION"
  | "PREPARING"
  | "WAITING_COURIER"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

const DELIVERY_COLUMNS: { key: DeliveryStatus; label: string }[] = [
  { key: "WAITING_PREPARATION", label: "Aguardando Preparo" },
  { key: "PREPARING", label: "Preparando" },
  { key: "WAITING_COURIER", label: "Aguardando Entregador" },
  { key: "OUT_FOR_DELIVERY", label: "Saíu para Entrega" },
  { key: "DELIVERED", label: "Entregue" },
];

const DELIVERY_COLUMN_COLORS: Record<DeliveryStatus, string> = {
  WAITING_PREPARATION: "border-t-slate-500",
  PREPARING: "border-t-orange-500",
  WAITING_COURIER: "border-t-sky-500",
  OUT_FOR_DELIVERY: "border-t-violet-500",
  DELIVERED: "border-t-green-600",
};

const DELIVERY_COLUMN_BG: Record<DeliveryStatus, string> = {
  WAITING_PREPARATION: "bg-slate-50/35",
  PREPARING: "bg-orange-50/35",
  WAITING_COURIER: "bg-sky-50/35",
  OUT_FOR_DELIVERY: "bg-violet-50/35",
  DELIVERED: "bg-green-50/35",
};

const DELIVERY_COLUMN_HEADER_BG: Record<DeliveryStatus, string> = {
  WAITING_PREPARATION: "bg-slate-100/55",
  PREPARING: "bg-orange-100/55",
  WAITING_COURIER: "bg-sky-100/55",
  OUT_FOR_DELIVERY: "bg-violet-100/55",
  DELIVERED: "bg-green-100/55",
};

const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  WAITING_PREPARATION: "Aguardando Preparo",
  PREPARING: "Preparando",
  WAITING_COURIER: "Aguardando Entregador",
  OUT_FOR_DELIVERY: "Saíu para Entrega",
  DELIVERED: "Entregue",
};

const DELIVERY_STATUS_COLOR: Record<DeliveryStatus, string> = {
  WAITING_PREPARATION: "bg-slate-100 text-slate-800",
  PREPARING: "bg-orange-100 text-orange-800",
  WAITING_COURIER: "bg-sky-100 text-sky-800",
  OUT_FOR_DELIVERY: "bg-violet-100 text-violet-800",
  DELIVERED: "bg-green-100 text-green-800",
};

// ─── Priority Meta ────────────────────────────────────────────────────────────

const PRIORITY_META = {
  normal: {
    label: "Normal",
    selectCls: "border-emerald-200 bg-emerald-100 text-emerald-700",
  },
  medium: {
    label: "Media",
    selectCls: "border-blue-200 bg-blue-100 text-blue-700",
  },
  high: {
    label: "Alta",
    selectCls: "border-orange-200 bg-orange-100 text-orange-700",
  },
  very_high: {
    label: "Muito alta",
    selectCls: "border-red-200 bg-red-100 text-red-700",
  },
} as const;

type OrderPriority = keyof typeof PRIORITY_META;

// ─── Map incoming orders to delivery statuses ─────────────────────────────────

function toDeliveryStatus(status: string): DeliveryStatus {
  if (status === "PREPARING") return "PREPARING";
  if (status === "READY_FOR_DELIVERY") return "WAITING_COURIER";
  if (status === "OUT_FOR_DELIVERY") return "OUT_FOR_DELIVERY";
  if (status === "DELIVERED") return "DELIVERED";
  return "WAITING_PREPARATION";
}

function buildDeliveryOrders(
  base: RecentOrder[],
): (RecentOrder & { status: DeliveryStatus })[] {
  return base.map((o) => ({
    ...o,
    status: toDeliveryStatus(o.status),
  })) as (RecentOrder & { status: DeliveryStatus })[];
}

// ─── Sortable Card ────────────────────────────────────────────────────────────

function SortableOrderCard({
  order,
  onPriorityChange,
}: {
  order: RecentOrder & { status: DeliveryStatus };
  onPriorityChange: (id: string, p: OrderPriority) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const currentPriority = (order.priority ?? "normal") as OrderPriority;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group cursor-grab active:cursor-grabbing rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/20",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 shrink-0 rounded p-0.5 text-foreground/80 hover:text-foreground"
        >
          <GripVertical size={14} />
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">
              {order.code}
            </span>
            <select
              value={currentPriority}
              onChange={(e) =>
                onPriorityChange(order.id, e.target.value as OrderPriority)
              }
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-medium outline-none",
                PRIORITY_META[currentPriority].selectCls,
              )}
            >
              <option value="normal">Normal</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="very_high">Muito alta</option>
            </select>
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

function OrderCardOverlay({ order }: { order: RecentOrder }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-card p-3 shadow-xl ring-2 ring-primary/20 w-72">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">
          <GripVertical size={14} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <span className="font-mono text-[11px] text-muted-foreground">
            {order.code}
          </span>
          <p className="truncate text-sm font-medium">{order.customerName}</p>
          <span className="font-medium text-foreground tabular-nums text-xs">
            {formatCurrency(order.totalCents)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Board Column ─────────────────────────────────────────────────────────────

function BoardColumn({
  status,
  orders,
  onPriorityChange,
  isDropTarget,
}: {
  status: DeliveryStatus;
  orders: (RecentOrder & { status: DeliveryStatus })[];
  onPriorityChange: (id: string, p: OrderPriority) => void;
  isDropTarget: boolean;
}) {
  const ids = orders.map((o) => o.id);
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-[260px] flex-1 flex-col overflow-hidden rounded-xl border border-border/80 border-t-4 transition-all",
        DELIVERY_COLUMN_COLORS[status],
        DELIVERY_COLUMN_BG[status],
        (isOver || isDropTarget) &&
          "ring-2 ring-primary/35 border-primary/40 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-10 flex items-center justify-between border-b border-border/50 px-4 py-3 backdrop-blur-sm",
          DELIVERY_COLUMN_HEADER_BG[status],
          (isOver || isDropTarget) && "bg-primary/10",
        )}
      >
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            DELIVERY_STATUS_COLOR[status],
          )}
        >
          {DELIVERY_STATUS_LABEL[status]}
        </span>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
          {orders.length}
        </span>
      </div>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          className={cn(
            "flex-1 space-y-2 overflow-y-auto p-3 min-h-[120px]",
            (isOver || isDropTarget) && "bg-primary/5",
          )}
        >
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Truck size={24} className="text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">Nenhum pedido</p>
            </div>
          ) : (
            orders.map((order) => (
              <SortableOrderCard
                key={order.id}
                order={order}
                onPriorityChange={onPriorityChange}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DeliveryBoardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<
    (RecentOrder & { status: DeliveryStatus })[]
  >(buildDeliveryOrders(ordersData as RecentOrder[]));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const columnData = useMemo(() => {
    const grouped: Record<
      DeliveryStatus,
      (RecentOrder & { status: DeliveryStatus })[]
    > = {
      WAITING_PREPARATION: [],
      PREPARING: [],
      WAITING_COURIER: [],
      OUT_FOR_DELIVERY: [],
      DELIVERED: [],
    };
    for (const order of orders) {
      grouped[order.status].push(order);
    }
    return grouped;
  }, [orders]);

  const activeOrder = activeId
    ? (orders.find((o) => o.id === activeId) ?? null)
    : null;

  function findColumn(id: string): DeliveryStatus | undefined {
    const col = DELIVERY_COLUMNS.find((c) => c.key === id);
    if (col) return col.key;
    return orders.find((o) => o.id === id)?.status;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }
    const activeCol = findColumn(active.id as string);
    const overCol = findColumn(over.id as string);
    setOverColumnId(overCol ?? null);
    if (!activeCol || !overCol || activeCol === overCol) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === active.id ? { ...o, status: overCol } : o)),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverColumnId(null);
    if (!over) return;
    const activeCol = findColumn(active.id as string);
    const overCol = findColumn(over.id as string);
    if (!activeCol || !overCol) return;
    if (activeCol !== overCol) {
      setOrders((prev) =>
        prev.map((o) => (o.id === active.id ? { ...o, status: overCol } : o)),
      );
    }
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

  function handlePriorityChange(orderId: string, priority: OrderPriority) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, priority } : o)),
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void navigate("/dashboard")}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Board de Entregas</h1>
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {orders.length} pedidos
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gerencie o preparo, despacho e entrega dos pedidos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void navigate("/orders/sales-board")}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ShoppingBag size={14} />
            Ver Board de Pedidos
          </button>
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
          onDragCancel={() => setOverColumnId(null)}
        >
          <div className="flex h-full gap-4">
            {DELIVERY_COLUMNS.map((col) => (
              <BoardColumn
                key={col.key}
                status={col.key}
                orders={columnData[col.key] ?? []}
                onPriorityChange={handlePriorityChange}
                isDropTarget={overColumnId === col.key}
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
