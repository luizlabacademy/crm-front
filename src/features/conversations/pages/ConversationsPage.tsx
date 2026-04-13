import { useEffect, useRef, useState, useMemo } from "react";
import {
  Home,
  Search,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  MessageCircle,
  Archive,
  Plus,
  Camera,
  Mail,
  Hash,
  Pencil,
  X,
  ArrowLeft,
  MessageSquarePlus,
  ShoppingCart,
  CalendarPlus,
  FileText,
  Package,
  Minus,
  Trash2,
  User,
  Users,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePersons } from "@/features/persons/api/usePersons";
import {
  getPersonDisplayName,
  type PersonResponse,
} from "@/features/persons/types/personTypes";
import type {
  ConversationContact,
  ChatMessage,
  ConversationChannel,
  ConversationContactType,
} from "@/features/conversations/types/conversationTypes";
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useCreateConversation,
} from "@/features/conversations/api/useConversations";
import { useCatalogItems } from "@/features/orders/api/useOrders";
import type { CatalogItemResponse } from "@/features/orders/types/orderTypes";
import { useOrders } from "@/features/orders/api/useOrders";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-amber-500",
    "bg-cyan-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return colors[hash % colors.length];
}

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function channelColor(channel: string): string {
  switch (channel) {
    case "WhatsApp":
      return "bg-green-100 text-green-700 border-green-200";
    case "Instagram":
      return "bg-pink-100 text-pink-700 border-pink-200";
    case "Facebook":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Corporativo":
      return "bg-violet-100 text-violet-700 border-violet-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function formatMessageTime(dateString: string): string {
  try {
    return format(parseISO(dateString), "HH:mm");
  } catch {
    return "";
  }
}

function formatContactTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return format(date, "HH:mm");
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return format(date, "EEEE", { locale: ptBR });
    return format(date, "dd/MM/yyyy");
  } catch {
    return "";
  }
}

function MessageStatus({ status }: { status?: string }) {
  if (status === "read")
    return <CheckCheck size={14} className="text-blue-500" />;
  if (status === "delivered")
    return <CheckCheck size={14} className="text-muted-foreground" />;
  if (status === "sent")
    return <Check size={14} className="text-muted-foreground" />;
  return null;
}

// ─── Contact List Item ────────────────────────────────────────────────────────

function ContactItem({
  contact,
  isActive,
  onClick,
}: {
  contact: ConversationContact;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50",
        isActive
          ? "bg-primary/5 border-l-2 border-l-primary"
          : "hover:bg-accent/50",
      )}
    >
      <div className="relative shrink-0">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white",
            avatarColor(contact.name),
          )}
        >
          {initial(contact.name)}
        </span>
        {contact.channel === "Corporativo" && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-white ring-1 ring-card">
            <Users size={9} />
          </span>
        )}
        {contact.isOnline && contact.channel !== "Corporativo" && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{contact.name}</p>
          <span
            className={cn(
              "shrink-0 text-[11px] whitespace-nowrap",
              contact.unreadCount > 0
                ? "text-primary font-medium"
                : "text-muted-foreground",
            )}
          >
            {formatContactTime(contact.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="truncate text-xs text-muted-foreground">
            {contact.lastMessage}
          </p>
          {contact.unreadCount > 0 && (
            <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {contact.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: ChatMessage }) {
  const isOutbound = message.direction === "outbound";
  return (
    <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
          isOutbound
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border rounded-bl-md",
        )}
      >
        {message.senderName && !isOutbound && (
          <p className="text-[10px] font-semibold text-primary mb-1">
            {message.senderName}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={cn(
            "flex items-center justify-end gap-1 mt-1 -mb-0.5",
            isOutbound ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          <span className="text-[10px]">
            {formatMessageTime(message.createdAt)}
          </span>
          {isOutbound && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  );
}

// ─── Date Separator ───────────────────────────────────────────────────────────

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center justify-center py-2">
      <span className="rounded-lg bg-muted/80 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
        {date}
      </span>
    </div>
  );
}

// ─── Empty Chat State ─────────────────────────────────────────────────────────

function EmptyChatState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center p-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
        <MessageSquarePlus size={36} className="text-muted-foreground/50" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-foreground">
          Selecione uma conversa
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha um contato na lista ao lado para iniciar a conversa
        </p>
      </div>
    </div>
  );
}

// ─── PDV Modal (fullscreen) ───────────────────────────────────────────────────

interface CartItem {
  item: CatalogItemResponse;
  quantity: number;
  unitPriceCents: number;
}

function PdvModal({
  onClose,
  onConfirm,
  contactName,
}: {
  onClose: () => void;
  onConfirm: (items: CartItem[], discount: number, notes: string) => void;
  contactName: string;
}) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountInput, setDiscountInput] = useState("0");
  const [notes, setNotes] = useState("");

  const { data: catalogItems = [], isLoading } = useCatalogItems();

  const filtered = useMemo(() => {
    if (!search.trim()) return catalogItems;
    return catalogItems.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [catalogItems, search]);

  function addToCart(item: CatalogItemResponse) {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { item, quantity: 1, unitPriceCents: item.priceCents }];
    });
  }

  function updateQty(itemId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c,
        )
        .filter((c) => c.quantity > 0),
    );
  }

  function removeFromCart(itemId: number) {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  }

  const subtotal = cart.reduce(
    (sum, c) => sum + c.unitPriceCents * c.quantity,
    0,
  );
  const discountCents = Math.round(parseFloat(discountInput || "0") * 100);
  const total = Math.max(0, subtotal - discountCents);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-base font-semibold">Novo Orçamento</h2>
            <p className="text-xs text-muted-foreground">
              Cliente: {contactName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(total)}
          </span>
          <button
            type="button"
            onClick={() => onConfirm(cart, discountCents, notes)}
            disabled={cart.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Confirmar Orçamento
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Catalog */}
        <div className="flex w-2/3 flex-col border-r border-border">
          <div className="border-b border-border px-4 py-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto pelo nome..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum produto encontrado
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((item) => {
                  const inCart = cart.find((c) => c.item.id === item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addToCart(item)}
                      className="group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-3 text-left hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Package size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-xs font-medium leading-tight line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(item.priceCents)}
                      </p>
                      {inCart && (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {inCart.quantity}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart + Totals */}
        <div className="flex w-1/3 flex-col">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">
              Carrinho ({cart.length} {cart.length === 1 ? "item" : "itens"})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Adicione produtos ao orçamento
              </p>
            ) : (
              cart.map((c) => (
                <div
                  key={c.item.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      {c.item.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatCurrency(c.unitPriceCents)} cada
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQty(c.item.id, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border hover:bg-accent transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-6 text-center text-xs font-medium tabular-nums">
                      {c.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(c.item.id, 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border hover:bg-accent transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(c.item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <span className="text-xs font-semibold tabular-nums">
                    {formatCurrency(c.unitPriceCents * c.quantity)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                Desconto (R$)
              </label>
              <input
                type="number"
                min="0"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm text-right outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="text-base font-semibold">Total</span>
              <span className="text-base font-bold text-primary tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações do orçamento..."
              rows={2}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Orders Panel (inside chat) ───────────────────────────────────────────────

function OrdersPanel({ onClose }: { onClose: () => void }) {
  const { data: ordersPage, isLoading } = useOrders({ page: 0, size: 20 });
  const orders = ordersPage?.content ?? [];

  return (
    <div className="absolute bottom-20 right-4 z-30 w-80 rounded-xl border border-border bg-card shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Pedidos Recentes</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        {isLoading ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Carregando...
          </p>
        ) : orders.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Nenhum pedido encontrado
          </p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent transition-colors"
            >
              <ClipboardList
                size={14}
                className="text-muted-foreground shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">
                  {order.code ?? `Pedido #${order.id}`}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatCurrency(order.totalCents)} — {order.status}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Appointment Panel (inside chat) ─────────────────────────────────────────

function AppointmentPanel({
  onClose,
  onSchedule,
  contactName,
}: {
  onClose: () => void;
  onSchedule: (date: string, time: string, notes: string) => void;
  contactName: string;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="absolute bottom-20 right-4 z-30 w-80 rounded-xl border border-border bg-card shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Novo Agendamento</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Cliente:{" "}
          <span className="font-medium text-foreground">{contactName}</span>
        </p>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Horário</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Serviço, observações..."
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          disabled={!date || !time}
          onClick={() => {
            onSchedule(date, time, notes);
            onClose();
          }}
          className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          Agendar
        </button>
      </div>
    </div>
  );
}

// ─── New Chat Modal ───────────────────────────────────────────────────────────

function NewChatModal({
  onClose,
  onCreateChat,
}: {
  onClose: () => void;
  onCreateChat: (
    person: PersonResponse,
    channel: ConversationChannel,
    contactType: ConversationContactType,
  ) => void;
}) {
  const [personSearch, setPersonSearch] = useState("");
  const [selectedChannel, setSelectedChannel] =
    useState<ConversationChannel>("WhatsApp");
  const [selectedType, setSelectedType] =
    useState<ConversationContactType>("customer");

  const { data: personsData, isLoading: isLoadingPersons } = usePersons({
    page: 0,
    size: 100,
  });
  const persons = personsData?.content ?? [];
  const filteredPersons = persons.filter((p) => {
    const name = getPersonDisplayName(p);
    return name.toLowerCase().includes(personSearch.toLowerCase());
  });

  const channels: {
    value: ConversationChannel;
    label: string;
    color: string;
  }[] = [
    {
      value: "WhatsApp",
      label: "WhatsApp",
      color: "bg-green-100 text-green-700 border-green-200",
    },
    {
      value: "Instagram",
      label: "Instagram",
      color: "bg-pink-100 text-pink-700 border-pink-200",
    },
    {
      value: "Facebook",
      label: "Facebook",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      value: "Site",
      label: "Site",
      color: "bg-gray-100 text-gray-700 border-gray-200",
    },
    {
      value: "Corporativo",
      label: "Chat Corporativo",
      color: "bg-violet-100 text-violet-700 border-violet-200",
    },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">Novo Atendimento</h2>
            <p className="text-xs text-muted-foreground">
              Selecione a pessoa, o canal e o tipo de conversa
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Type selector */}
        <div className="border-b border-border px-4 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Tipo de conversa
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedType("customer");
                if (selectedChannel === "Corporativo")
                  setSelectedChannel("WhatsApp");
              }}
              className={cn(
                "flex flex-1 items-center gap-2 justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                selectedType === "customer"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              <User size={14} />
              Cliente
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedType("agent");
                setSelectedChannel("Corporativo");
              }}
              className={cn(
                "flex flex-1 items-center gap-2 justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                selectedType === "agent"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              <Users size={14} />
              Atendente (Interno)
            </button>
          </div>
        </div>

        {/* Channel selector */}
        <div className="border-b border-border px-4 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Canal
          </p>
          <div className="flex flex-wrap gap-2">
            {channels
              .filter((c) =>
                selectedType === "agent"
                  ? c.value === "Corporativo"
                  : c.value !== "Corporativo",
              )
              .map((ch) => (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => setSelectedChannel(ch.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    selectedChannel === ch.value
                      ? ch.color + " ring-2 ring-offset-1 ring-primary/40"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {ch.label}
                </button>
              ))}
          </div>
        </div>

        {/* Person search */}
        <div className="border-b border-border px-4 py-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={personSearch}
              onChange={(e) => setPersonSearch(e.target.value)}
              placeholder={
                selectedType === "agent"
                  ? "Buscar atendente por nome..."
                  : "Buscar cliente por nome..."
              }
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
          </div>
        </div>

        <div className="max-h-[40vh] overflow-y-auto p-2">
          {isLoadingPersons ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">
              Carregando pessoas...
            </p>
          ) : filteredPersons.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">
              Nenhuma pessoa encontrada.
            </p>
          ) : (
            filteredPersons.map((person) => {
              const name = getPersonDisplayName(person);
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() =>
                    onCreateChat(person, selectedChannel, selectedType)
                  }
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shrink-0",
                        avatarColor(name),
                      )}
                    >
                      {initial(name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        pessoa #{person.id}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-primary shrink-0 ml-2">
                    Iniciar
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Channel Filters ──────────────────────────────────────────────────────────

const ALL_CHANNELS: { value: string; label: string }[] = [
  { value: "Todos", label: "Todos" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
  { value: "Site", label: "Site" },
  { value: "Corporativo", label: "Corporativo" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ConversationsPage() {
  const navigate = useNavigate();
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [localContacts, setLocalContacts] = useState<ConversationContact[]>([]);
  const [localMessages, setLocalMessages] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("Todos");
  const [chatTab, setChatTab] = useState<"all" | "open" | "closed">("open");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [displayName, setDisplayName] = useState("Atendente CRM");
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [showPdv, setShowPdv] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [showAppointmentPanel, setShowAppointmentPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentProfile = {
    fullName: "Atendente CRM",
    email: "atendente@crm.local",
    code: "ATD-001",
    photoUrl: "https://i.pravatar.cc/240?img=12",
  };

  // ─── API Data ────────────────────────────────────────────────────────────────
  const { data: apiContacts = [], isLoading: isLoadingContacts } =
    useConversations();
  const { data: apiMessages = [] } = useConversationMessages(
    activeContactId,
    localContacts.find((c) => c.id === activeContactId)?.leadId,
  );
  const sendMessageMutation = useSendMessage();
  const createConversationMutation = useCreateConversation();

  // Merge API contacts with locally created ones
  const contacts = useMemo(() => {
    const apiIds = new Set(apiContacts.map((c) => c.id));
    const onlyLocal = localContacts.filter((c) => !apiIds.has(c.id));
    return [...apiContacts, ...onlyLocal];
  }, [apiContacts, localContacts]);

  // Merge API messages with locally sent ones
  const activeMessages = useMemo(() => {
    if (!activeContactId) return [];
    const local = localMessages[activeContactId] ?? [];
    const api = apiMessages;
    // Deduplicate by id
    const seen = new Set<string>();
    const merged: ChatMessage[] = [];
    for (const m of [...api, ...local]) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        merged.push(m);
      }
    }
    merged.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return merged;
  }, [activeContactId, apiMessages, localMessages]);

  const activeContact = contacts.find((c) => c.id === activeContactId) ?? null;

  // Filter contacts
  const filteredContacts = useMemo(() => {
    let result = contacts;
    // search
    if (search.trim()) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.channel.toLowerCase().includes(search.toLowerCase()) ||
          c.lastMessage.toLowerCase().includes(search.toLowerCase()),
      );
    }
    // channel filter
    if (channelFilter !== "Todos") {
      result = result.filter((c) => c.channel === channelFilter);
    }
    // tab filter
    if (chatTab === "open")
      result = result.filter((c) => (c.unreadCount ?? 0) > 0);
    if (chatTab === "closed")
      result = result.filter((c) => (c.unreadCount ?? 0) === 0);
    return result;
  }, [contacts, search, channelFilter, chatTab]);

  const openChatsCount = contacts.filter(
    (c) => (c.unreadCount ?? 0) > 0,
  ).length;
  const archivedChatsCount = contacts.filter(
    (c) => (c.unreadCount ?? 0) === 0,
  ).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContactId, activeMessages.length]);

  function handleSelectContact(id: string) {
    setActiveContactId(id);
    setShowMobileChat(true);
    setShowOrdersPanel(false);
    setShowAppointmentPanel(false);
  }

  function handleBack() {
    setShowMobileChat(false);
  }

  function handleSend() {
    if (!newMessage.trim() || !activeContactId) return;
    const contact = contacts.find((c) => c.id === activeContactId);
    const msg: ChatMessage = {
      id: `local-${Date.now()}`,
      contactId: activeContactId,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      direction: "outbound",
      status: "sent",
      channel: contact?.channel ?? "Site",
    };
    // Optimistic update
    setLocalMessages((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] ?? []), msg],
    }));
    setNewMessage("");
    // Fire-and-forget API call
    void sendMessageMutation.mutateAsync({
      conversationId: activeContactId,
      leadId: contact?.leadId,
      payload: { content: newMessage.trim(), direction: "outbound" },
    });
  }

  function handleCreateChat(
    person: PersonResponse,
    channel: ConversationChannel,
    contactType: ConversationContactType,
  ) {
    const personName = getPersonDisplayName(person);
    const existing = contacts.find(
      (c) =>
        c.name.toLowerCase() === personName.toLowerCase() &&
        c.channel === channel,
    );
    if (existing) {
      setActiveContactId(existing.id);
      setShowMobileChat(true);
      setShowNewChatModal(false);
      return;
    }
    const now = new Date().toISOString();
    const newId = `local-conv-${person.id}-${Date.now()}`;
    const newContact: ConversationContact = {
      id: newId,
      leadId: `person-${person.id}`,
      name: personName,
      channel,
      contactType,
      lastMessage: "Conversa iniciada.",
      lastMessageAt: now,
      unreadCount: 1,
      sentiment: "warm",
      isOnline: false,
    };
    setLocalContacts((prev) => [newContact, ...prev]);
    setLocalMessages((prev) => ({ ...prev, [newId]: [] }));
    setActiveContactId(newId);
    setShowMobileChat(true);
    setShowNewChatModal(false);
    setChatTab("open");
    // Also fire create via API
    void createConversationMutation.mutateAsync({
      personId: person.id,
      channel,
      contactType,
    });
  }

  function handlePdvConfirm(
    items: CartItem[],
    discountCents: number,
    _notes: string,
  ) {
    if (items.length === 0) return;
    const subtotal = items.reduce(
      (s, c) => s + c.unitPriceCents * c.quantity,
      0,
    );
    const total = Math.max(0, subtotal - discountCents);
    const summary = items
      .map((c) => `${c.quantity}x ${c.item.name}`)
      .join(", ");
    const msg: ChatMessage = {
      id: `local-${Date.now()}`,
      contactId: activeContactId!,
      content: `Orçamento enviado:\n${summary}\nTotal: ${formatCurrency(total)}`,
      createdAt: new Date().toISOString(),
      direction: "outbound",
      status: "sent",
      channel: activeContact?.channel ?? "Site",
    };
    setLocalMessages((prev) => ({
      ...prev,
      [activeContactId!]: [...(prev[activeContactId!] ?? []), msg],
    }));
    setShowPdv(false);
  }

  function handleScheduleConfirm(date: string, time: string, notes: string) {
    const msg: ChatMessage = {
      id: `local-${Date.now()}`,
      contactId: activeContactId!,
      content: `Agendamento confirmado:\nData: ${date} às ${time}${notes ? `\nObs: ${notes}` : ""}`,
      createdAt: new Date().toISOString(),
      direction: "outbound",
      status: "sent",
      channel: activeContact?.channel ?? "Site",
    };
    setLocalMessages((prev) => ({
      ...prev,
      [activeContactId!]: [...(prev[activeContactId!] ?? []), msg],
    }));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function groupedMessages(
    msgs: ChatMessage[],
  ): { date: string; messages: ChatMessage[] }[] {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";
    for (const msg of msgs) {
      const date = (() => {
        try {
          const d = parseISO(msg.createdAt);
          const now = new Date();
          const diffDays = Math.floor(
            (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (diffDays === 0) return "Hoje";
          if (diffDays === 1) return "Ontem";
          return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        } catch {
          return "—";
        }
      })();
      if (date !== currentDate) {
        groups.push({ date, messages: [msg] });
        currentDate = date;
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  }

  return (
    <>
      {showPdv && activeContact && (
        <PdvModal
          onClose={() => setShowPdv(false)}
          onConfirm={handlePdvConfirm}
          contactName={activeContact.name}
        />
      )}

      <div className="relative flex h-[100dvh] overflow-hidden bg-muted/30">
        {/* ─── Left icon sidebar ─────────────────────────────────────────── */}
        <aside className="hidden w-24 shrink-0 border-r border-border bg-card md:flex md:flex-col">
          <nav className="flex-1 space-y-1 px-2 py-3">
            <button
              type="button"
              onClick={() => void navigate("/dashboard")}
              className="flex w-full flex-col items-center gap-1 rounded-xl border border-transparent px-1 py-2 text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Home size={24} />
              <span className="leading-none">Home</span>
            </button>
            <button
              type="button"
              onClick={() => setChatTab("open")}
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[10px] transition-colors",
                chatTab === "open"
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <MessageCircle size={24} />
              <span className="leading-none">Atendimentos</span>
            </button>
            <button
              type="button"
              onClick={() => setChatTab("closed")}
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[10px] transition-colors",
                chatTab === "closed"
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Archive size={24} />
              <span className="leading-none">Arquivados</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewChatModal(true);
              }}
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[10px] transition-colors",
                showNewChatModal
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Plus size={24} />
              <span className="leading-none">Novo</span>
            </button>
          </nav>

          <div className="border-t border-border mx-2" />
          <div className="p-3">
            <button
              type="button"
              onClick={() => setShowProfilePanel(true)}
              className="flex w-full flex-col items-center gap-1 rounded-xl p-2 hover:bg-accent transition-colors"
            >
              <img
                src={agentProfile.photoUrl}
                alt="Foto do atendente"
                className="h-11 w-11 rounded-full object-cover ring-2 ring-border"
              />
              <span className="text-[10px] text-muted-foreground leading-none">
                Perfil
              </span>
            </button>
          </div>
        </aside>

        <div className="flex flex-1 overflow-hidden">
          {/* ─── Contact List ─────────────────────────────────────────────── */}
          <div
            className={cn(
              "flex w-full min-h-0 flex-col border-r border-border bg-card lg:w-96 lg:min-w-[24rem] shrink-0",
              showMobileChat ? "hidden lg:flex" : "flex",
            )}
          >
            <div className="flex h-16 items-center justify-between gap-3 border-b border-border px-4">
              <h1 className="text-lg font-semibold">Conversas</h1>
              <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {contacts.reduce((s, c) => s + c.unreadCount, 0)} nao lidas
              </span>
            </div>

            <div className="px-3 py-2 border-b border-border">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar conversa..."
                  className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Channel filter chips */}
            <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-border">
              {ALL_CHANNELS.map((ch) => (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => setChannelFilter(ch.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    channelFilter === ch.value
                      ? ch.value === "Corporativo"
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            {/* Contact list */}
            <div
              className="flex-1 min-h-0 overflow-y-scroll [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]"
              style={{ scrollbarGutter: "stable" }}
            >
              {isLoadingContacts ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Carregando conversas...
                </p>
              ) : filteredContacts.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma conversa encontrada.
                </p>
              ) : (
                filteredContacts.map((contact) => (
                  <ContactItem
                    key={contact.id}
                    contact={contact}
                    isActive={contact.id === activeContactId}
                    onClick={() => handleSelectContact(contact.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ─── Chat Panel ──────────────────────────────────────────────── */}
          <div
            className={cn(
              "flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden",
              showMobileChat ? "flex" : "hidden lg:flex",
            )}
          >
            {/* Chat header */}
            <div className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 shrink-0">
              <button
                type="button"
                onClick={handleBack}
                className="lg:hidden rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="relative shrink-0">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white",
                    avatarColor(activeContact?.name ?? "Conversa"),
                  )}
                >
                  {initial(activeContact?.name ?? "Conversa")}
                </span>
                {activeContact?.isOnline && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {activeContact?.name ?? "Selecione uma conversa"}
                </p>
                <div className="flex items-center gap-2">
                  {activeContact ? (
                    <>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          channelColor(activeContact.channel),
                        )}
                      >
                        {activeContact.channel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {activeContact.isOnline
                          ? "Online"
                          : `visto por ultimo ${formatRelative(activeContact.lastMessageAt)}`}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Escolha um contato para iniciar o atendimento
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  disabled={!activeContact}
                >
                  <Phone size={16} />
                </button>
                <button
                  type="button"
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  disabled={!activeContact}
                >
                  <Video size={16} />
                </button>
                <button
                  type="button"
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  disabled={!activeContact}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 min-h-0 overflow-y-scroll px-4 py-4 space-y-2"
              style={{
                scrollbarGutter: "stable",
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, var(--color-border) 0.5px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            >
              {!activeContact ? (
                <EmptyChatState />
              ) : (
                groupedMessages(activeMessages).map((group) => (
                  <div key={group.date} className="space-y-2">
                    <DateSeparator date={group.date} />
                    {group.messages.map((msg) => (
                      <ChatBubble key={msg.id} message={msg} />
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Floating panels */}
            {showOrdersPanel && activeContact && (
              <OrdersPanel onClose={() => setShowOrdersPanel(false)} />
            )}
            {showAppointmentPanel && activeContact && (
              <AppointmentPanel
                onClose={() => setShowAppointmentPanel(false)}
                onSchedule={handleScheduleConfirm}
                contactName={activeContact.name}
              />
            )}

            {/* Input area */}
            <div className="border-t border-border bg-card px-4 py-3 shrink-0">
              {/* Action toolbar (above input) */}
              {activeContact && (
                <div className="mb-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPdv(true);
                      setShowOrdersPanel(false);
                      setShowAppointmentPanel(false);
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Criar orçamento"
                  >
                    <FileText size={12} />
                    Orçamento
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOrdersPanel((v) => !v);
                      setShowAppointmentPanel(false);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors",
                      showOrdersPanel
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                    title="Ver pedidos"
                  >
                    <ShoppingCart size={12} />
                    Pedidos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAppointmentPanel((v) => !v);
                      setShowOrdersPanel(false);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors",
                      showAppointmentPanel
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                    title="Agendar"
                  >
                    <CalendarPlus size={12} />
                    Agendar
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 mb-0.5"
                  disabled={!activeContact}
                >
                  <Smile size={20} />
                </button>
                <button
                  type="button"
                  className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 mb-0.5"
                  disabled={!activeContact}
                >
                  <Paperclip size={20} />
                </button>
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder={
                      activeContact
                        ? "Digite uma mensagem..."
                        : "Selecione uma conversa para enviar mensagens"
                    }
                    disabled={!activeContact}
                    className="h-10 w-full resize-none overflow-y-auto rounded-2xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground disabled:opacity-60"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!activeContact || !newMessage.trim()}
                  className="flex items-center justify-center rounded-full bg-primary p-2.5 text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 mb-0.5"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── New Chat Modal ──────────────────────────────────────────────── */}
        {showNewChatModal && (
          <NewChatModal
            onClose={() => setShowNewChatModal(false)}
            onCreateChat={(person, channel, type) =>
              handleCreateChat(person, channel, type)
            }
          />
        )}

        {/* ─── Agent Profile Panel ─────────────────────────────────────────── */}
        {showProfilePanel && (
          <>
            <button
              type="button"
              onClick={() => {
                setShowProfilePanel(false);
                setEditingDisplayName(false);
              }}
              className="fixed inset-0 z-40 bg-black/30"
              aria-label="Fechar painel de perfil"
            />
            <aside className="absolute right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold">Perfil do atendente</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfilePanel(false);
                    setEditingDisplayName(false);
                  }}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto p-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <img
                      src={agentProfile.photoUrl}
                      alt="Foto do atendente"
                      className="h-24 w-24 rounded-full object-cover ring-2 ring-border"
                    />
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 rounded-full border border-border bg-card p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      title="Editar foto"
                    >
                      <Camera size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-medium">{agentProfile.fullName}</p>
                </div>
                <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Nome completo
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {agentProfile.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Nome para exibicao
                    </p>
                    {editingDisplayName ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (displayName.trim())
                              setEditingDisplayName(false);
                          }}
                          className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{displayName}</p>
                        <button
                          type="button"
                          onClick={() => setEditingDisplayName(true)}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
                        >
                          <Pencil size={12} />
                          Editar
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail size={14} className="mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        E-mail
                      </p>
                      <p className="text-sm">{agentProfile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Hash size={14} className="mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Codigo
                      </p>
                      <p className="text-sm">{agentProfile.code}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-3 text-center">
                    <p className="text-xl font-semibold tabular-nums">
                      {openChatsCount}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Chats abertos
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 text-center">
                    <p className="text-xl font-semibold tabular-nums">
                      {archivedChatsCount}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Chats arquivados
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </>
  );
}
