import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  MessageSquare,
  Megaphone,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

type NotificationType = "lead" | "order" | "campaign" | "chat";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  unread: boolean;
  type: NotificationType;
}

type NotificationFilter = "all" | "unread" | "read";

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    title: "Novo lead recebido",
    description: "Lead do canal WhatsApp aguardando atendimento.",
    createdAt: "agora",
    unread: true,
    type: "lead",
  },
  {
    id: "n-2",
    title: "Pedido atualizado",
    description: "Pedido #1042 alterado para status Em separacao.",
    createdAt: "ha 12 min",
    unread: true,
    type: "order",
  },
  {
    id: "n-3",
    title: "Campanha finalizada",
    description: "Campanha Recovery Abril foi concluida.",
    createdAt: "ha 1 h",
    unread: false,
    type: "campaign",
  },
  {
    id: "n-4",
    title: "Nova conversa iniciada",
    description: "Cliente Ana Paula iniciou uma conversa no Instagram.",
    createdAt: "ha 2 h",
    unread: true,
    type: "chat",
  },
  {
    id: "n-5",
    title: "Lead convertido em cliente",
    description: "Lead #883 foi convertido com sucesso.",
    createdAt: "ontem",
    unread: false,
    type: "lead",
  },
];

function typeIcon(type: NotificationType) {
  switch (type) {
    case "lead":
      return <UserPlus size={15} />;
    case "order":
      return <ShoppingCart size={15} />;
    case "campaign":
      return <Megaphone size={15} />;
    case "chat":
      return <MessageSquare size={15} />;
    default:
      return <Bell size={15} />;
  }
}

export function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [items, setItems] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());

  const unreadCount = items.filter((item) => item.unread).length;

  const filtered = useMemo(() => {
    if (filter === "unread") return items.filter((item) => item.unread);
    if (filter === "read") return items.filter((item) => !item.unread);
    return items;
  }, [filter, items]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function markAsRead(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
  }

  function markAllAsRead() {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notificacoes</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Acompanhe eventos importantes do CRM em um unico lugar.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck size={16} />
          Marcar todas como lidas
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="mt-1 text-2xl font-semibold">{items.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Nao lidas</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {unreadCount}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Lidas</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">
            {items.length - unreadCount}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Hoje</p>
          <p className="mt-1 text-2xl font-semibold">
            {items.filter((item) => item.createdAt !== "ontem").length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter size={13} />
            Filtro
          </span>

          {(
            [
              { value: "all", label: "Todas" },
              { value: "unread", label: "Nao lidas" },
              { value: "read", label: "Lidas" },
            ] as { value: NotificationFilter; label: string }[]
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="px-4 py-14 text-center text-muted-foreground">
            <Bell className="mx-auto mb-2 opacity-40" size={24} />
            <p className="text-sm">Nenhuma notificacao encontrada.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {pagedItems.map((item) => (
              <li key={item.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      item.unread
                        ? "bg-blue-100 text-blue-700"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {typeIcon(item.type)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.createdAt}
                      </p>
                    </div>

                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.description}
                    </p>

                    {item.unread && (
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        <Check size={13} />
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <TablePagination
          page={page - 1}
          totalPages={totalPages}
          totalElements={filtered.length}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setDefaultPageSize(size);
            setPageSize(size);
            setPage(1);
          }}
          onFirst={() => setPage(1)}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onLast={() => setPage(totalPages)}
        />
      </div>
    </div>
  );
}
