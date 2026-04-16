export interface CampaignFilterOption {
  id: string;
  label: string;
  weight: number;
}

export const CAMPAIGN_OPTIONS: CampaignFilterOption[] = [
  { id: "whatsapp-vip", label: "WhatsApp VIP", weight: 0.25 },
  { id: "email-news", label: "E-mail Newsletter", weight: 0.2 },
  { id: "retarget-meta", label: "Retarget Meta", weight: 0.2 },
  { id: "google-search", label: "Google Search", weight: 0.2 },
  { id: "indicacoes", label: "Indicacoes", weight: 0.15 },
];

export function getCampaignWeightRatio(selectedIds: string[]): number {
  if (selectedIds.length === 0) {
    return 1;
  }

  const allWeight = CAMPAIGN_OPTIONS.reduce((sum, campaign) => {
    return sum + campaign.weight;
  }, 0);

  const selectedWeight = CAMPAIGN_OPTIONS.filter((campaign) => {
    return selectedIds.includes(campaign.id);
  }).reduce((sum, campaign) => {
    return sum + campaign.weight;
  }, 0);

  return Math.max(0.15, selectedWeight / allWeight);
}
