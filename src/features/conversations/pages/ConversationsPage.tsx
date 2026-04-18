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
import { SearchModal } from "@/components/shared/SearchModal";
import type {
  ConversationContact,
  ChatMessage,
  ConversationChannel,
  ConversationContactType,
} from "@/features/conversations/types/conversationTypes";
import contactsResponse from "@/mocks/conversations/get-contacts.json";
import messagesResponse from "@/mocks/conversations/get-messages.json";
import catalogItemsResponse from "@/mocks/conversations/get-catalog-items.json";
import conversationOrdersResponse from "@/mocks/conversations/get-recent-orders.json";
import channelsResponse from "@/mocks/conversations/get-channels.json";
import profileResponse from "@/mocks/account/get-profile.json";
import type { CatalogItemResponse } from "@/features/orders/types/orderTypes";
import {
  QuoteComposerOverlay,
  type QuoteFinalizePayload,
} from "@/features/orders/components/QuoteComposerOverlay";

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

let localIdCounter = 0;

function nextLocalId(prefix = "local"): string {
  localIdCounter += 1;
  return `${prefix}-${localIdCounter}`;
}

interface PersonResponse {
  id: number;
  fullName: string;
}

function getPersonDisplayName(person: PersonResponse): string {
  return person.fullName;
}

interface MockOrder {
  id: number;
  code?: string | null;
  totalCents: number;
  status: string;
}

const MOCK_CONTACTS: ConversationContact[] = (
  contactsResponse.data as Array<
    ConversationContact & { contactType?: ConversationContactType }
  >
).map((contact) => ({
  ...contact,
  channel: contact.channel as ConversationChannel,
  contactType: (contact.contactType ?? "customer") as ConversationContactType,
}));

const MOCK_MESSAGES = messagesResponse.data as unknown as Record<
  string,
  ChatMessage[]
>;

const MOCK_PERSONS: PersonResponse[] = MOCK_CONTACTS.map((contact, index) => ({
  id: index + 1,
  fullName: contact.name,
}));

const MOCK_CATALOG_ITEMS: CatalogItemResponse[] =
  catalogItemsResponse.data as CatalogItemResponse[];

const MOCK_RECENT_ORDERS: MockOrder[] =
  conversationOrdersResponse.data as MockOrder[];

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
        "flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors",
        isActive
          ? "border-l-2 border-l-primary bg-primary/10"
          : "hover:bg-background/80",
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
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute bottom-1.5 h-3 w-3 rotate-45",
            isOutbound
              ? "-right-1.5 bg-primary"
              : "-left-1.5 border-b border-l border-border bg-card",
          )}
        />
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

// ─── Orders Panel (inside chat) ───────────────────────────────────────────────

function OrdersPanel({ onClose }: { onClose: () => void }) {
  const orders = MOCK_RECENT_ORDERS;
  const isLoading = false;

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

  const persons = MOCK_PERSONS;
  const isLoadingPersons = false;
  const filteredPersons = persons.filter((p) => {
    const name = getPersonDisplayName(p);
    return name.toLowerCase().includes(personSearch.toLowerCase());
  });

  const channels = channelsResponse.data as {
    value: ConversationChannel;
    label: string;
    color: string;
  }[];

  return (
    <SearchModal
      open
      title="Novo Atendimento"
      description="Selecione a pessoa, o canal e o tipo de conversa"
      query={personSearch}
      onQueryChange={setPersonSearch}
      onClose={onClose}
      placeholder={
        selectedType === "agent"
          ? "Buscar atendente por nome..."
          : "Buscar cliente por nome..."
      }
      className="max-w-xl"
    >
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

      <div className="border-b border-border px-4 py-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Canal</p>
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
    </SearchModal>
  );
}

// ─── Channel Filters ──────────────────────────────────────────────────────────

const ALL_CHANNELS: { value: string; label: string }[] = [
  { value: "Todos", label: "Todos" },
  ...channelsResponse.data.map((ch) => ({ value: ch.value, label: ch.label })),
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ConversationsPage() {
  const navigate = useNavigate();
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [localContacts, setLocalContacts] =
    useState<ConversationContact[]>(MOCK_CONTACTS);
  const [localMessages, setLocalMessages] =
    useState<Record<string, ChatMessage[]>>(MOCK_MESSAGES);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("Todos");
  const [chatTab, setChatTab] = useState<"all" | "open" | "closed">("open");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [displayName, setDisplayName] = useState(profileResponse.data.fullName);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [showPdv, setShowPdv] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [showAppointmentPanel, setShowAppointmentPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentProfile = {
    fullName: profileResponse.data.fullName,
    email: profileResponse.data.email,
    code: profileResponse.data.code,
    photoUrl: profileResponse.data.avatarUrl,
  };

  const isLoadingContacts = false;

  const contacts = useMemo(() => localContacts, [localContacts]);

  const activeMessages = useMemo(() => {
    if (!activeContactId) return [];
    return (localMessages[activeContactId] ?? [])
      .slice()
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [activeContactId, localMessages]);

  const activeContact = contacts.find((c) => c.id === activeContactId) ?? null;
  const budgetCustomers = useMemo(
    () =>
      contacts.map((contact, index) => ({ id: index + 1, name: contact.name })),
    [contacts],
  );
  const selectedBudgetCustomerId = useMemo(() => {
    if (!activeContact) return null;
    const found = budgetCustomers.find(
      (customer) => customer.name === activeContact.name,
    );
    return found?.id ?? null;
  }, [activeContact, budgetCustomers]);

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

  function handleBackToWorkspace() {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    void navigate("/dashboard");
  }

  function handleSend() {
    if (!newMessage.trim() || !activeContactId) return;
    const contact = contacts.find((c) => c.id === activeContactId);
    const msg: ChatMessage = {
      id: nextLocalId(),
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
    const newId = nextLocalId(`local-conv-${person.id}`);
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
  }

  function handlePdvConfirm(payload: QuoteFinalizePayload) {
    if (payload.lines.length === 0) return;
    const summary = payload.lines
      .map((line) => {
        const item = MOCK_CATALOG_ITEMS.find(
          (catalog) => catalog.id === line.itemId,
        );
        return `${line.quantity}x ${item?.name ?? `Item #${line.itemId}`}`;
      })
      .join(", ");
    const paymentLabel: Record<string, string> = {
      pix: "Pix",
      cartao: "Cartão",
      boleto: "Boleto",
      dinheiro: "Dinheiro",
    };
    const paymentText =
      payload.paymentMethods.length > 0
        ? payload.paymentMethods
            .map(
              (entry) =>
                `${paymentLabel[entry.method] ?? entry.method} ${formatCurrency(entry.amountCents)}`,
            )
            .join(" + ")
        : paymentLabel[payload.paymentMethod];
    const deliveryText = `Entrega: ${payload.deliveryAddress ?? "não informado"}`;
    const msg: ChatMessage = {
      id: nextLocalId(),
      contactId: activeContactId!,
      content: `Orçamento finalizado para ${payload.customerName} (#${payload.customerId}):\n${summary}\nTotal: ${formatCurrency(payload.totalCents)}\nPagamento: ${paymentText}\n${deliveryText}`,
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
      id: nextLocalId(),
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
        <QuoteComposerOverlay
          open={showPdv}
          onClose={() => setShowPdv(false)}
          title="Novo Orçamento"
          catalogItems={MOCK_CATALOG_ITEMS}
          customers={budgetCustomers}
          initialCustomerId={selectedBudgetCustomerId}
          onFinalize={handlePdvConfirm}
        />
      )}

      <div className="relative flex h-[100dvh] overflow-hidden bg-slate-200/60">
        {/* ─── Left icon sidebar ─────────────────────────────────────────── */}
        <aside className="hidden w-24 shrink-0 border-r border-slate-700 bg-slate-900 text-slate-100 md:flex md:flex-col">
          <nav className="flex-1 space-y-1 px-2 py-3">
            <button
              type="button"
              onClick={() => {
                if (document.fullscreenElement) {
                  void document.exitFullscreen().catch(() => undefined);
                }
                void navigate("/dashboard");
              }}
              className="flex w-full flex-col items-center gap-1 rounded-xl border border-transparent px-1 py-2 text-[10px] text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
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
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-100",
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
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-100",
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
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-100",
              )}
            >
              <Plus size={24} />
              <span className="leading-none">Novo</span>
            </button>
          </nav>

          <div className="mx-2 border-t border-slate-700" />
          <div className="p-3">
            <button
              type="button"
              onClick={() => setShowProfilePanel(true)}
              className="flex w-full flex-col items-center gap-1 rounded-xl p-2 transition-colors hover:bg-slate-800"
            >
              <img
                src={agentProfile.photoUrl}
                alt="Foto do atendente"
                className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-600"
              />
              <span className="text-[10px] leading-none text-slate-300">
                Perfil
              </span>
            </button>
          </div>
        </aside>

        <div className="flex flex-1 overflow-hidden border-l border-slate-300/70">
          {/* ─── Contact List ─────────────────────────────────────────────── */}
          <div
            className={cn(
              "flex w-full min-h-0 flex-col border-r border-slate-300/70 bg-white lg:w-96 lg:min-w-[24rem] shrink-0",
              showMobileChat ? "hidden lg:flex" : "flex",
            )}
          >
            <div className="flex h-16 items-center justify-between gap-3 border-b border-slate-300/70 bg-slate-100/90 px-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBackToWorkspace}
                  className="rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 lg:hidden"
                  aria-label="Voltar para dashboard"
                >
                  <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-semibold text-slate-900">Chat</h1>
              </div>
              <span className="inline-flex items-center rounded-full border border-slate-300/80 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {contacts.reduce((s, c) => s + c.unreadCount, 0)} nao lidas
              </span>
            </div>

            <div className="border-b border-slate-200 bg-white px-3 py-2">
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
            <div className="flex flex-wrap gap-1.5 border-b border-slate-200 bg-slate-50/80 px-3 py-2">
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
              "flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden bg-slate-100/70",
              showMobileChat ? "flex" : "hidden lg:flex",
            )}
          >
            {/* Chat header */}
            <div className="flex h-16 items-center gap-3 border-b border-slate-300/80 bg-white px-4 shadow-sm shrink-0">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 lg:hidden"
              >
                <ArrowLeft size={18} />
                <span className="text-xs font-medium">Conversas</span>
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
                  "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.55)), radial-gradient(circle at 1px 1px, rgba(148,163,184,0.25) 0.5px, transparent 0)",
                backgroundSize: "100% 100%, 24px 24px",
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
            <div className="border-t border-slate-300/80 bg-white px-4 py-3 shadow-[0_-1px_0_rgba(15,23,42,0.04)] shrink-0">
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
