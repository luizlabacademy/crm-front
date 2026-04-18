import campaignOptionsResponse from "@/mocks/GET-dashboard--campaign-options.json";

export interface CampaignFilterOption {
  id: string;
  label: string;
  weight: number;
}

export const CAMPAIGN_OPTIONS: CampaignFilterOption[] =
  campaignOptionsResponse.responseBody as CampaignFilterOption[];

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
