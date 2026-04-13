export interface ConversationContact {
  id: string;
  leadId: string;
  name: string;
  channel: "WhatsApp" | "Instagram" | "Facebook" | "Site";
  avatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  sentiment?: "hot" | "warm" | "cold";
  isOnline?: boolean;
}

export interface ChatMessage {
  id: string;
  contactId: string;
  content: string;
  createdAt: string;
  direction: "inbound" | "outbound";
  status?: "sent" | "delivered" | "read";
  channel: string;
}
