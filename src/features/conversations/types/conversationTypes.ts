// ─── Channel Types ────────────────────────────────────────────────────────────

export type ConversationChannel =
  | "WhatsApp"
  | "Instagram"
  | "Facebook"
  | "Site"
  | "Corporativo";

export type ConversationContactType = "customer" | "agent";

// ─── Conversation Contact ─────────────────────────────────────────────────────

export interface ConversationContact {
  id: string;
  leadId: string;
  name: string;
  channel: ConversationChannel;
  contactType: ConversationContactType;
  avatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  sentiment?: "hot" | "warm" | "cold";
  isOnline?: boolean;
}

// ─── Chat Message ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  contactId: string;
  content: string;
  createdAt: string;
  direction: "inbound" | "outbound";
  status?: "sent" | "delivered" | "read";
  channel: string;
  senderName?: string;
}

// ─── API types (from /api/v1/conversations) ───────────────────────────────────

export interface ConversationApiResponse {
  id: string | number;
  leadId?: string | number;
  personId?: number;
  personName?: string;
  channel: string;
  contactType?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationMessageApiResponse {
  id: string | number;
  conversationId?: string | number;
  leadId?: string | number;
  content?: string;
  message?: string;
  direction?: "inbound" | "outbound";
  channel?: string;
  status?: string;
  senderName?: string;
  createdAt?: string;
  sentAt?: string;
}

export interface SendMessageRequest {
  content?: string;
  message?: string;
  channel?: string;
  direction?: "outbound";
  createdByUserId?: number;
}
