export const ORDER_STATUS = {
  NEW: "NEW",
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  PREPARING: "PREPARING",
  READY_FOR_DELIVERY: "READY_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Labels used in the dashboard filter chips and board columns. */
export const BOARD_COLUMNS: { key: "ALL" | OrderStatus; label: string }[] = [
  { key: "ALL", label: "Todos" },
  { key: "NEW", label: "Novos" },
  { key: "AWAITING_PAYMENT", label: "Aguardando Pagamento" },
  { key: "PREPARING", label: "Preparar" },
  { key: "READY_FOR_DELIVERY", label: "Pronto Para Entrega" },
  { key: "DELIVERED", label: "Entregues" },
];

export const ORDER_STATUS_LABEL: Record<string, string> = {
  [ORDER_STATUS.NEW]: "Novo",
  [ORDER_STATUS.AWAITING_PAYMENT]: "Aguardando Pagamento",
  [ORDER_STATUS.PREPARING]: "Preparar",
  [ORDER_STATUS.READY_FOR_DELIVERY]: "Pronto Para Entrega",
  [ORDER_STATUS.DELIVERED]: "Entregue",
  [ORDER_STATUS.CANCELLED]: "Cancelado",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  [ORDER_STATUS.NEW]: "bg-blue-100 text-blue-800",
  [ORDER_STATUS.AWAITING_PAYMENT]: "bg-yellow-100 text-yellow-800",
  [ORDER_STATUS.PREPARING]: "bg-orange-100 text-orange-800",
  [ORDER_STATUS.READY_FOR_DELIVERY]: "bg-emerald-100 text-emerald-800",
  [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-800",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
};
