export const LEAD_STATUS = {
  ACTIVE: "ACTIVE",
  IN_PROGRESS: "IN_PROGRESS",
  CLOSED: "CLOSED",
  CONVERTED: "CONVERTED",
  LOST: "LOST",
} as const;

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];

export const LEAD_STATUS_LABEL: Record<string, string> = {
  [LEAD_STATUS.ACTIVE]: "Ativo",
  [LEAD_STATUS.IN_PROGRESS]: "Em andamento",
  [LEAD_STATUS.CLOSED]: "Concluído",
  [LEAD_STATUS.CONVERTED]: "Convertido",
  [LEAD_STATUS.LOST]: "Perdido",
};

/** Statuses considered "active/in progress" for dashboard KPI */
export const LEAD_ACTIVE_STATUSES: string[] = [
  LEAD_STATUS.ACTIVE,
  LEAD_STATUS.IN_PROGRESS,
];

/** Statuses considered "closed/finished" for dashboard KPI */
export const LEAD_CLOSED_STATUSES: string[] = [
  LEAD_STATUS.CLOSED,
  LEAD_STATUS.CONVERTED,
];
