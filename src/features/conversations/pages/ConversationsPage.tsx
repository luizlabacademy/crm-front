import { useEffect, useRef, useState } from "react";
import {
  Search,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  ArrowLeft,
  MessageSquarePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/utils/formatDate";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  ConversationContact,
  ChatMessage,
} from "@/features/conversations/types/conversationTypes";
import contactsData from "@/features/conversations/mocks/contacts.json";
import messagesData from "@/features/conversations/mocks/messages.json";

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
    case "Site":
      return "bg-gray-100 text-gray-700 border-gray-200";
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
  if (status === "read") {
    return <CheckCheck size={14} className="text-blue-500" />;
  }
  if (status === "delivered") {
    return <CheckCheck size={14} className="text-muted-foreground" />;
  }
  if (status === "sent") {
    return <Check size={14} className="text-muted-foreground" />;
  }
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
      {/* Avatar */}
      <div className="relative shrink-0">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white",
            avatarColor(contact.name),
          )}
        >
          {initial(contact.name)}
        </span>
        {contact.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
        )}
      </div>

      {/* Content */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ConversationsPage() {
  const [contacts] = useState<ConversationContact[]>(
    contactsData as ConversationContact[],
  );
  const [allMessages] = useState<Record<string, ChatMessage[]>>(
    messagesData as unknown as Record<string, ChatMessage[]>,
  );
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact = contacts.find((c) => c.id === activeContactId) ?? null;
  const activeMessages = activeContactId
    ? (allMessages[activeContactId] ?? [])
    : [];

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.channel.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase()),
  );

  // Scroll to bottom when conversation changes or messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContactId, activeMessages.length]);

  function handleSelectContact(id: string) {
    setActiveContactId(id);
    setShowMobileChat(true);
  }

  function handleBack() {
    setShowMobileChat(false);
  }

  function handleSend() {
    if (!newMessage.trim() || !activeContactId) return;
    // In a real app this would call an API
    setNewMessage("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by date
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
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh)] overflow-hidden bg-muted/30">
      {/* ─── Contact List (sidebar) ────────────────────────────────────── */}
      <div
        className={cn(
          "flex w-full flex-col border-r border-border bg-card lg:w-96 lg:min-w-[24rem] shrink-0",
          showMobileChat ? "hidden lg:flex" : "flex",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <h1 className="text-lg font-semibold">Conversas</h1>
          <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {contacts.reduce((s, c) => s + c.unreadCount, 0)} não lidas
          </span>
        </div>

        {/* Search */}
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
        <div className="flex gap-1.5 px-3 py-2 border-b border-border overflow-x-auto">
          {["Todos", "WhatsApp", "Instagram", "Facebook", "Site"].map((ch) => (
            <button
              key={ch}
              type="button"
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                ch === "Todos"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
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

      {/* ─── Chat Panel ────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex flex-1 flex-col min-w-0",
          showMobileChat ? "flex" : "hidden lg:flex",
        )}
      >
        {!activeContact ? (
          <EmptyChatState />
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
              {/* Back button (mobile) */}
              <button
                type="button"
                onClick={handleBack}
                className="lg:hidden rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <ArrowLeft size={18} />
              </button>

              {/* Avatar */}
              <div className="relative shrink-0">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white",
                    avatarColor(activeContact.name),
                  )}
                >
                  {initial(activeContact.name)}
                </span>
                {activeContact.isOnline && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {activeContact.name}
                </p>
                <div className="flex items-center gap-2">
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
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Ligar"
                >
                  <Phone size={16} />
                </button>
                <button
                  type="button"
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Video"
                >
                  <Video size={16} />
                </button>
                <button
                  type="button"
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Mais opcoes"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, var(--color-border) 0.5px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            >
              {groupedMessages(activeMessages).map((group) => (
                <div key={group.date} className="space-y-2">
                  <DateSeparator date={group.date} />
                  {group.messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-border bg-card px-4 py-3 shrink-0">
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 mb-0.5"
                  title="Emoji"
                >
                  <Smile size={20} />
                </button>
                <button
                  type="button"
                  className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 mb-0.5"
                  title="Anexar arquivo"
                >
                  <Paperclip size={20} />
                </button>
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Digite uma mensagem..."
                    className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground max-h-32"
                    style={{ minHeight: "2.5rem" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="flex items-center justify-center rounded-full bg-primary p-2.5 text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 mb-0.5"
                  title="Enviar"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
