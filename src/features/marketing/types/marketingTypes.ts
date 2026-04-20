// ─── Lead Board Types ─────────────────────────────────────────────────────────

export type LeadBoardStatus =
  | "LEAD"
  | "AGENDADO"
  | "ATENDIDO"
  | "CANCELADO"
  | "NAO_COMPARECEU";

export interface LeadBoardCard {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: LeadBoardStatus;
  /** null means "all campaigns" (unfiltered view) */
  campaignId: string | null;
  campaignName: string | null;
  source: string;
  estimatedValueCents: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  /** ISO date-time when the lead is/was scheduled */
  scheduledAt: string | null;
  /** ISO date-time when the lead was attended */
  attendedAt: string | null;
  /** ISO date-time when the lead was cancelled */
  cancelledAt: string | null;
}

// ─── Campaign Types ───────────────────────────────────────────────────────────

export type CampaignType = "Remarketing" | "Recovery" | "Re-engagement";
export type CampaignStatus = "Ativa" | "Pausada" | "Finalizada";
export type CampaignDestinationType = "whatsapp" | "landing_page";
export type CampaignAudienceType = "full_list" | "no_purchase_days" | "no_show";

export interface CampaignDestination {
  type: CampaignDestinationType;
  url: string;
}

export interface CampaignAudience {
  type: CampaignAudienceType;
  /** Required when type === "no_purchase_days" */
  days?: number;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  replied: number;
  converted: number;
  clicked: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  createdAt: string;
  destination: CampaignDestination;
  audience: CampaignAudience;
  templateId: string;
  metrics: CampaignMetrics;
}

/** Shape used when creating a campaign (UI → mock service) */
export interface CreateCampaignPayload {
  name: string;
  type: CampaignType;
  audience: CampaignAudience;
  templateId: string;
  templateContent: string;
  destination: CampaignDestination;
}

// ─── Aggregated Metrics (used in summary bar) ─────────────────────────────────

export interface CampaignsMetricsSummary {
  sent: number;
  replied: number;
  converted: number;
  replyRate: number;
  conversionRate: number;
}

// ─── Contact List Types ───────────────────────────────────────────────────────

export type ContactChannel = "whatsapp" | "email";

export interface MarketingContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  channel: ContactChannel;
  tags: string[];
  source: string;
  /** Whether the contact opted in to receive messages */
  optIn: boolean;
  createdAt: string;
}

// ─── Marketing Automation Types ───────────────────────────────────────────────

export type AutomationTemplateType =
  | "carrinho_abandonado"
  | "reativacao_clientes"
  | "lembrete_agendamento"
  | "followup_pos_atendimento";

export interface AutomationTemplate {
  id: string;
  name: string;
  type: AutomationTemplateType;
  message: string;
}

export type AutomationTriggerType = "tempo" | "status";

export type AutomationTriggerEvent =
  | "abandono_carrinho"
  | "sem_retorno"
  | "agendado"
  | "atendido";

export interface AutomationTrigger {
  type: AutomationTriggerType;
  event: AutomationTriggerEvent;
  /** Positive = delay after event; negative = advance before event */
  delayHours?: number;
  delayDays?: number;
}

export type AutomationStatus = "Ativa" | "Pausada";

export interface MarketingAutomation {
  id: string;
  name: string;
  templateId: string;
  trigger: AutomationTrigger;
  status: AutomationStatus;
  createdAt: string;
}

// ─── Landing Page Types ───────────────────────────────────────────────────────

export type LandingPageTheme = "rose" | "dark" | "minimal";

export type LandingPageThemeStyleId =
  | "rose-bloom"
  | "rose-sunset"
  | "rose-coral"
  | "dark-gold"
  | "dark-slate"
  | "dark-emerald"
  | "minimal-clean"
  | "minimal-soft"
  | "minimal-contrast";

export interface LandingPageSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}

export interface LandingPageService {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
}

export interface LandingPageBusinessInfo {
  salonName: string;
  tagline: string;
  description: string;
  phone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  instagramUrl: string;
  facebookUrl: string;
  logoUrl: string;
}

export interface LandingPageConfig {
  theme: LandingPageTheme;
  themeStyleId?: LandingPageThemeStyleId;
  businessInfo: LandingPageBusinessInfo;
  slides: LandingPageSlide[];
  services: LandingPageService[];
  showOnlyServicesWithPhotos?: boolean;
}

// ─── Coupon Types ─────────────────────────────────────────────────────────────

export type CouponType = "percentage" | "fixed";
export type CouponStatus = "Ativo" | "Expirado" | "Inativo";

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  /** Discount value: percentage (0-100) or fixed amount in cents */
  value: number;
  /** Minimum order value in cents to apply the coupon (0 = no minimum) */
  minOrderCents: number;
  /** Maximum number of total uses (null = unlimited) */
  maxUses: number | null;
  usedCount: number;
  /** Maximum uses per customer (null = unlimited) */
  maxUsesPerCustomer: number | null;
  status: CouponStatus;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreateCouponPayload {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minOrderCents: number;
  maxUses: number | null;
  maxUsesPerCustomer: number | null;
  startsAt: string;
  expiresAt: string;
}

// ─── Cashback Types ───────────────────────────────────────────────────────────

export type CashbackRuleStatus = "Ativa" | "Inativa";

export interface CashbackRule {
  id: string;
  name: string;
  /** Percentage of order value returned as cashback (0-100) */
  percentage: number;
  /** Maximum cashback amount in cents per transaction (null = unlimited) */
  maxAmountCents: number | null;
  /** Minimum order value in cents to earn cashback (0 = no minimum) */
  minOrderCents: number;
  /** Days until cashback expires after being earned (null = never) */
  expirationDays: number | null;
  status: CashbackRuleStatus;
  /** Total cashback distributed in cents */
  totalDistributedCents: number;
  /** Total cashback redeemed in cents */
  totalRedeemedCents: number;
  /** Number of customers who have earned cashback from this rule */
  totalCustomers: number;
  createdAt: string;
}

export interface CreateCashbackRulePayload {
  name: string;
  percentage: number;
  maxAmountCents: number | null;
  minOrderCents: number;
  expirationDays: number | null;
}

// ─── Affiliate Types ──────────────────────────────────────────────────────────

export type AffiliateStatus = "Ativo" | "Inativo" | "Pendente";

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** Unique referral code */
  referralCode: string;
  /** Commission percentage on referred sales (0-100) */
  commissionPercent: number;
  status: AffiliateStatus;
  /** Total referred sales in cents */
  totalSalesCents: number;
  /** Total commission earned in cents */
  totalCommissionCents: number;
  /** Total commission already paid out in cents */
  totalPaidCents: number;
  /** Number of customers referred */
  referralCount: number;
  createdAt: string;
}

export interface CreateAffiliatePayload {
  name: string;
  email: string;
  phone: string;
  commissionPercent: number;
}
