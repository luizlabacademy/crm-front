/**
 * Centralized Mock API Service
 *
 * All mock data lives under `src/mocks/` organized by domain.
 * Each JSON file represents a single future REST endpoint response.
 *
 * To migrate to a real API:
 *  1. Replace the import + return with a fetch/axios call
 *  2. The response shape already follows REST conventions ({ data, meta })
 *  3. Delete the corresponding JSON file once the real endpoint is live
 */

// ─── Dashboard ───────────────────────────────────────────────────────────────

import type {
  FunnelData,
  FunnelPeriod,
  ConversionPeriod,
  ConversionRateData,
  RecentMessage,
  RecentOrder,
} from "@/features/dashboard/types/dashboardTypes";
import type { CampaignFilterOption } from "@/features/dashboard/constants/campaignFilter";

import funnel30d from "@/mocks/dashboard/get-funnel-30d.json";
import funnel60d from "@/mocks/dashboard/get-funnel-60d.json";
import funnel90d from "@/mocks/dashboard/get-funnel-90d.json";
import funnel180d from "@/mocks/dashboard/get-funnel-180d.json";
import funnel1y from "@/mocks/dashboard/get-funnel-1y.json";
import funnel2y from "@/mocks/dashboard/get-funnel-2y.json";
import funnel5y from "@/mocks/dashboard/get-funnel-5y.json";
import funnelAll from "@/mocks/dashboard/get-funnel-all.json";
import conversionDaily from "@/mocks/dashboard/get-conversion-rate-daily.json";
import conversionMonthly from "@/mocks/dashboard/get-conversion-rate-monthly.json";
import conversionYearly from "@/mocks/dashboard/get-conversion-rate-yearly.json";
import recentMessages from "@/mocks/dashboard/get-recent-messages.json";
import recentOrders from "@/mocks/dashboard/get-recent-orders.json";
import campaignOptions from "@/mocks/dashboard/get-campaign-options.json";

// ─── Campaigns ───────────────────────────────────────────────────────────────

import campaigns from "@/mocks/campaigns/get-campaigns.json";
import contactLists from "@/mocks/campaigns/get-contact-lists.json";

// ─── Conversations ───────────────────────────────────────────────────────────

import contacts from "@/mocks/conversations/get-contacts.json";
import messages from "@/mocks/conversations/get-messages.json";
import catalogItems from "@/mocks/conversations/get-catalog-items.json";
import conversationRecentOrders from "@/mocks/conversations/get-recent-orders.json";
import channels from "@/mocks/conversations/get-channels.json";

// ─── Account ─────────────────────────────────────────────────────────────────

import profile from "@/mocks/account/get-profile.json";
import notifications from "@/mocks/account/get-notifications.json";

// ─── Dashboard API ───────────────────────────────────────────────────────────

const funnelMap: Record<FunnelPeriod, typeof funnel30d> = {
  "30d": funnel30d,
  "60d": funnel60d,
  "90d": funnel90d,
  "180d": funnel180d,
  "1y": funnel1y,
  "2y": funnel2y,
  "5y": funnel5y,
  all: funnelAll,
};

export async function getFunnelData(period: FunnelPeriod): Promise<FunnelData> {
  const response = funnelMap[period];
  return response.data as unknown as FunnelData;
}

const conversionMap: Record<ConversionPeriod, typeof conversionDaily> = {
  daily: conversionDaily,
  monthly: conversionMonthly,
  yearly: conversionYearly,
};

export async function getConversionRateData(
  period: ConversionPeriod,
): Promise<ConversionRateData> {
  const response = conversionMap[period];
  return {
    period: response.data.period as ConversionPeriod,
    data: response.data.series,
  };
}

export async function getRecentMessagesData(): Promise<RecentMessage[]> {
  return recentMessages.data as RecentMessage[];
}

export async function getRecentOrdersData(): Promise<RecentOrder[]> {
  return recentOrders.data as RecentOrder[];
}

export async function getCampaignOptions(): Promise<CampaignFilterOption[]> {
  return campaignOptions.data as CampaignFilterOption[];
}

// ─── Campaigns API ───────────────────────────────────────────────────────────

export interface MockCampaign {
  id: number;
  name: string;
  channel: "whatsapp" | "email";
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  listName: string;
  sentCount: number;
  totalCount: number;
  openRate?: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface MockContactList {
  id: number;
  name: string;
  channel: "whatsapp" | "email";
  contactCount: number;
  createdAt: string;
}

export async function getCampaigns(): Promise<MockCampaign[]> {
  return campaigns.data as MockCampaign[];
}

export async function getContactLists(): Promise<MockContactList[]> {
  return contactLists.data as MockContactList[];
}

// ─── Conversations API ───────────────────────────────────────────────────────

export async function getConversationContacts() {
  return contacts.data;
}

export async function getConversationMessages() {
  return messages.data;
}

export interface MockCatalogItem {
  id: number;
  tenantId: number;
  name: string;
  description: string;
  priceCents: number;
}

export async function getCatalogItems(): Promise<MockCatalogItem[]> {
  return catalogItems.data as MockCatalogItem[];
}

export interface MockConversationOrder {
  id: number;
  code: string;
  totalCents: number;
  status: string;
}

export async function getConversationRecentOrders(): Promise<
  MockConversationOrder[]
> {
  return conversationRecentOrders.data as MockConversationOrder[];
}

export interface MockChannel {
  value: string;
  label: string;
  color: string;
}

export async function getChannels(): Promise<MockChannel[]> {
  return channels.data as MockChannel[];
}

// ─── Account API ─────────────────────────────────────────────────────────────

export interface MockProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  code: string;
  avatarUrl: string;
}

export async function getProfile(): Promise<MockProfile> {
  return profile.data as MockProfile;
}

export interface MockNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<MockNotification[]> {
  return notifications.data as MockNotification[];
}

export function getNotificationsUnreadCount(): number {
  return notifications.meta.unreadCount;
}
