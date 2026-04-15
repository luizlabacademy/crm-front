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
  businessInfo: LandingPageBusinessInfo;
  slides: LandingPageSlide[];
  services: LandingPageService[];
}
