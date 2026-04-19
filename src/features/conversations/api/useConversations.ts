/**
 * useConversations
 *
 * API hooks for the CRM conversations feature.
 * Supports real API calls with graceful fallback to mocks when the API
 * is not available (e.g., during local development).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  ConversationContact,
  ChatMessage,
  ConversationApiResponse,
  ConversationMessageApiResponse,
  SendMessageRequest,
  ConversationChannel,
  ConversationContactType,
} from "@/features/conversations/types/conversationTypes";
import contactsResponse from "@/mocks/GET-conversations--contacts.json";
import messagesResponse from "@/mocks/GET-conversations--messages.json";

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapApiToContact(raw: ConversationApiResponse): ConversationContact {
  const channel = (raw.channel ?? "Site") as ConversationChannel;
  const contactType = (
    raw.contactType === "agent" ? "agent" : "customer"
  ) as ConversationContactType;
  return {
    id: String(raw.id),
    leadId: String(raw.leadId ?? raw.id),
    name: raw.personName ?? `Contato #${raw.id}`,
    channel,
    contactType,
    lastMessage: raw.lastMessage ?? "",
    lastMessageAt:
      raw.lastMessageAt ??
      raw.updatedAt ??
      raw.createdAt ??
      new Date().toISOString(),
    unreadCount: raw.unreadCount ?? 0,
    sentiment: "warm",
    isOnline: false,
  };
}

function mapApiToMessage(
  raw: ConversationMessageApiResponse,
  contactId: string,
): ChatMessage {
  return {
    id: String(raw.id),
    contactId,
    content: raw.content ?? raw.message ?? "",
    createdAt: raw.createdAt ?? raw.sentAt ?? new Date().toISOString(),
    direction: raw.direction ?? "inbound",
    status: (raw.status as ChatMessage["status"]) ?? "sent",
    channel: raw.channel ?? "Site",
    senderName: raw.senderName,
  };
}

// ─── List Conversations ───────────────────────────────────────────────────────

export interface UseConversationsParams {
  page?: number;
  size?: number;
  channel?: string;
  status?: string;
  tenantId?: number | null;
}

export function useConversations(params: UseConversationsParams = {}) {
  const { page = 0, size = 50, channel, status, tenantId } = params;

  return useQuery<ConversationContact[]>({
    queryKey: ["conversations", { page, size, channel, status, tenantId }],
    queryFn: async () => {
      try {
        const { data } = await api.get<
          { content: ConversationApiResponse[] } | ConversationApiResponse[]
        >("/api/v1/conversations", {
          params: {
            page,
            size,
            ...(channel ? { channel } : {}),
            ...(status ? { status } : {}),
            ...(tenantId != null ? { tenantId } : {}),
          },
        });

        const list = Array.isArray(data) ? data : data.content;
        return list.map(mapApiToContact);
      } catch {
        // Graceful fallback to mock data during development
        return (contactsResponse.responseBody as ConversationContact[]).map(
          (c) => ({
            ...c,
            contactType: (c.contactType ??
              "customer") as ConversationContactType,
          }),
        );
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// ─── List Messages for a Conversation ────────────────────────────────────────

export function useConversationMessages(
  conversationId: string | null,
  leadId?: string,
) {
  return useQuery<ChatMessage[]>({
    queryKey: ["conversation-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      // Try conversation-specific endpoint first
      const endpoints = [
        `/api/v1/conversations/${conversationId}/messages`,
        ...(leadId ? [`/api/v1/leads/${leadId}/messages`] : []),
      ];

      for (const endpoint of endpoints) {
        try {
          const { data } = await api.get<
            | { content: ConversationMessageApiResponse[] }
            | ConversationMessageApiResponse[]
          >(endpoint, { params: { page: 0, size: 100 } });

          const list = Array.isArray(data) ? data : data.content;
          return list.map((m) => mapApiToMessage(m, conversationId));
        } catch {
          continue;
        }
      }

      // Fallback to mock
      const mockRecord = messagesResponse.responseBody as Record<
        string,
        ChatMessage[]
      >;
      return mockRecord[conversationId] ?? [];
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000,
  });
}

// ─── Send Message ─────────────────────────────────────────────────────────────

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<
    ChatMessage,
    Error,
    { conversationId: string; leadId?: string; payload: SendMessageRequest }
  >({
    mutationFn: async ({ conversationId, leadId, payload }) => {
      // Try conversation endpoint first, then lead fallback
      const endpoints = [
        `/api/v1/conversations/${conversationId}/messages`,
        ...(leadId ? [`/api/v1/leads/${leadId}/messages`] : []),
      ];

      for (const endpoint of endpoints) {
        try {
          const { data } = await api.post<ConversationMessageApiResponse>(
            endpoint,
            payload,
          );
          return mapApiToMessage(data, conversationId);
        } catch {
          continue;
        }
      }

      // Optimistic local fallback (no API available)
      const localMsg: ChatMessage = {
        id: `local-${Date.now()}`,
        contactId: conversationId,
        content: payload.content ?? payload.message ?? "",
        createdAt: new Date().toISOString(),
        direction: "outbound",
        status: "sent",
        channel: payload.channel ?? "Site",
      };
      return localMsg;
    },
    onSuccess: (_data, { conversationId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["conversation-messages", conversationId],
      });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ─── Create Conversation ──────────────────────────────────────────────────────

export interface CreateConversationRequest {
  personId: number;
  channel: string;
  contactType: "customer" | "agent";
  tenantId?: number;
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation<ConversationContact, Error, CreateConversationRequest>({
    mutationFn: async (body) => {
      try {
        const { data } = await api.post<ConversationApiResponse>(
          "/api/v1/conversations",
          body,
        );
        return mapApiToContact(data);
      } catch {
        // Local fallback — create a virtual conversation
        const now = new Date().toISOString();
        return {
          id: `local-conv-${Date.now()}`,
          leadId: `person-${body.personId}`,
          name: `Contato #${body.personId}`,
          channel: body.channel as ConversationChannel,
          contactType: body.contactType,
          lastMessage: "Conversa iniciada.",
          lastMessageAt: now,
          unreadCount: 0,
          sentiment: "warm",
          isOnline: false,
        };
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
