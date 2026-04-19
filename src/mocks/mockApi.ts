/**
 * Centralized Mock API Service
 *
 * All mock data lives under `src/mocks/` following the spec structure:
 * { method, route, requestBody, responseBody }
 *
 * To migrate to a real API:
 *  1. Replace the import + return with a fetch/axios call
 *  2. Delete the corresponding JSON file once the real endpoint is live
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

import funnel30d from "@/mocks/GET-dashboard--funnel--30d.json";
import funnel60d from "@/mocks/GET-dashboard--funnel--60d.json";
import funnel90d from "@/mocks/GET-dashboard--funnel--90d.json";
import funnel180d from "@/mocks/GET-dashboard--funnel--180d.json";
import funnel1y from "@/mocks/GET-dashboard--funnel--1y.json";
import funnel2y from "@/mocks/GET-dashboard--funnel--2y.json";
import funnel5y from "@/mocks/GET-dashboard--funnel--5y.json";
import funnelAll from "@/mocks/GET-dashboard--funnel--all.json";
import conversionDaily from "@/mocks/GET-dashboard--conversion-rate--daily.json";
import conversionMonthly from "@/mocks/GET-dashboard--conversion-rate--monthly.json";
import conversionYearly from "@/mocks/GET-dashboard--conversion-rate--yearly.json";
import recentMessages from "@/mocks/GET-dashboard--recent-messages.json";
import recentOrders from "@/mocks/GET-dashboard--recent-orders.json";
import campaignOptions from "@/mocks/GET-dashboard--campaign-options.json";

// ─── Campaigns ───────────────────────────────────────────────────────────────

import campaigns from "@/mocks/GET-campaigns.json";
import contactLists from "@/mocks/GET-campaigns--contact-lists.json";

// ─── Conversations ───────────────────────────────────────────────────────────

import contacts from "@/mocks/GET-conversations--contacts.json";
import messages from "@/mocks/GET-conversations--messages.json";
import catalogItems from "@/mocks/GET-conversations--catalog-items.json";
import conversationRecentOrders from "@/mocks/GET-conversations--recent-orders.json";
import channels from "@/mocks/GET-conversations--channels.json";

// ─── Account ─────────────────────────────────────────────────────────────────

import profile from "@/mocks/GET-account--profile.json";
import notifications from "@/mocks/GET-account--notifications.json";

// ─── Marketing ───────────────────────────────────────────────────────────────

import marketingLeads from "@/mocks/GET-marketing--leads.json";
import marketingCampaigns from "@/mocks/GET-marketing--campaigns.json";

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
  return response.responseBody as FunnelData;
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
    period: response.responseBody.period as ConversionPeriod,
    data: response.responseBody.series,
  };
}

export async function getRecentMessagesData(): Promise<RecentMessage[]> {
  return recentMessages.responseBody as RecentMessage[];
}

export async function getRecentOrdersData(): Promise<RecentOrder[]> {
  return recentOrders.responseBody as RecentOrder[];
}

export async function getCampaignOptions(): Promise<CampaignFilterOption[]> {
  return campaignOptions.responseBody as CampaignFilterOption[];
}

// ─── Campaigns API ───────────────────────────────────────────────────────────

export interface CampaignItem {
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

export interface ContactListItem {
  id: number;
  name: string;
  channel: "whatsapp" | "email";
  contactCount: number;
  createdAt: string;
}

export async function getCampaigns(): Promise<CampaignItem[]> {
  return campaigns.responseBody as CampaignItem[];
}

export async function getContactLists(): Promise<ContactListItem[]> {
  return contactLists.responseBody as ContactListItem[];
}

// ─── Conversations API ───────────────────────────────────────────────────────

export async function getConversationContacts() {
  return contacts.responseBody;
}

export async function getConversationMessages() {
  return messages.responseBody;
}

export interface CatalogItem {
  id: number;
  tenantId: number;
  name: string;
  description: string;
  priceCents: number;
}

export async function getCatalogItems(): Promise<CatalogItem[]> {
  return catalogItems.responseBody as CatalogItem[];
}

export interface ConversationOrder {
  id: number;
  code: string;
  totalCents: number;
  status: string;
}

export async function getConversationRecentOrders(): Promise<
  ConversationOrder[]
> {
  return conversationRecentOrders.responseBody as ConversationOrder[];
}

export interface Channel {
  value: string;
  label: string;
  color: string;
}

export async function getChannels(): Promise<Channel[]> {
  return channels.responseBody as Channel[];
}

// ─── Account API ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  code: string;
  avatarUrl: string;
}

export async function getProfile(): Promise<UserProfile> {
  return profile.responseBody as UserProfile;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  return notifications.responseBody as Notification[];
}

export function getNotificationsUnreadCount(): number {
  return (notifications.responseBody as Notification[]).length;
}

// ─── Marketing API ───────────────────────────────────────────────────────────

import type {
  LeadBoardCard,
  MarketingCampaign,
} from "@/features/marketing/types/marketingTypes";

export async function getMarketingLeads(): Promise<LeadBoardCard[]> {
  return marketingLeads.responseBody as LeadBoardCard[];
}

export async function getMarketingCampaigns(): Promise<MarketingCampaign[]> {
  return marketingCampaigns.responseBody as MarketingCampaign[];
}
