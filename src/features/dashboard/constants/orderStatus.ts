export const ORDER_STATUS = {
  PENDING: "PENDING",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
  IN_PROGRESS: "IN_PROGRESS",
  CONFIRMED: "CONFIRMED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABEL: Record<string, string> = {
  [ORDER_STATUS.PENDING]: "Pendente",
  [ORDER_STATUS.CLOSED]: "Fechado",
  [ORDER_STATUS.CANCELLED]: "Cancelado",
  [ORDER_STATUS.IN_PROGRESS]: "Em andamento",
  [ORDER_STATUS.CONFIRMED]: "Confirmado",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  [ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [ORDER_STATUS.CLOSED]: "bg-green-100 text-green-800",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
  [ORDER_STATUS.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [ORDER_STATUS.CONFIRMED]: "bg-emerald-100 text-emerald-800",
};
