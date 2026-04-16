// ─── Enums / Literals ───────────────────────────────────────────────

export type AccountStatus = "active" | "inactive";
export type AccountType = "one_time" | "recurring";
export type Periodicity =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "bimonthly"
  | "quarterly"
  | "annual";

export type ExpenseStatus = "open" | "overdue" | "partial" | "paid";
export type PaymentMethod =
  | "pix"
  | "boleto"
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "cash";

// ─── Category ───────────────────────────────────────────────────────

export interface ExpenseCategory {
  id: string;
  name: string;
}

// ─── Cost Center ────────────────────────────────────────────────────

export interface CostCenter {
  id: string;
  name: string;
}

// ─── Recurrence Config ──────────────────────────────────────────────

export interface RecurrenceConfig {
  periodicity: Periodicity;
  startDate: string; // ISO
  endDate?: string; // ISO, optional
  dueDay: number; // 1-31
  autoGenerate: boolean;
  notes?: string;
}

// ─── Account (Cadastro de Contas) ───────────────────────────────────

export interface ExpenseAccount {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  supplier: string;
  defaultAmountCents: number;
  defaultPaymentMethod: PaymentMethod;
  costCenterId: string;
  costCenterName: string;
  defaultDueDay: number;
  status: AccountStatus;
  type: AccountType;
  recurrence?: RecurrenceConfig;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// ─── Expense (Despesa) ──────────────────────────────────────────────

export interface Expense {
  id: string;
  description: string;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  supplier: string;
  amountCents: number;
  paidAmountCents?: number;
  dueDate: string; // ISO
  paymentDate?: string; // ISO
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  isRecurring: boolean;
  notes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// ─── Paginated Response ─────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ─── Filter Types ───────────────────────────────────────────────────

export interface AccountFilters {
  search: string;
  categoryId: string;
  type: AccountType | "";
  status: AccountStatus | "";
  isRecurring: string; // "yes" | "no" | ""
}

export interface PendingExpenseFilters {
  search: string;
  dueDateFrom: string;
  dueDateTo: string;
  categoryId: string;
  supplier: string;
  status: ExpenseStatus | "";
  paymentMethod: PaymentMethod | "";
  amountMin: string;
  amountMax: string;
}

export interface PaidExpenseFilters {
  search: string;
  paymentDateFrom: string;
  paymentDateTo: string;
  categoryId: string;
  supplier: string;
  paymentMethod: PaymentMethod | "";
  amountMin: string;
  amountMax: string;
}

// ─── KPI Types ──────────────────────────────────────────────────────

export interface AccountKpis {
  total: number;
  active: number;
  recurring: number;
  inactive: number;
}

export interface PendingExpenseKpis {
  totalAmountCents: number;
  count: number;
  dueToday: number;
  overdue: number;
  next7Days: number;
}

export interface PaidExpenseKpis {
  totalPaidCents: number;
  count: number;
  paidToday: number;
  paidThisMonth: number;
  averageCents: number;
}

// ─── Display labels ─────────────────────────────────────────────────

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Ativa",
  inactive: "Inativa",
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  one_time: "Avulsa",
  recurring: "Recorrente",
};

export const PERIODICITY_LABELS: Record<Periodicity, string> = {
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
  bimonthly: "Bimestral",
  quarterly: "Trimestral",
  annual: "Anual",
};

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  open: "Em aberto",
  overdue: "Vencida",
  partial: "Parcial",
  paid: "Paga",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "PIX",
  boleto: "Boleto",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  bank_transfer: "Transferência Bancária",
  cash: "Dinheiro",
};

// ─── Status color maps (for StatusBadge) ────────────────────────────

export const ACCOUNT_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
};

export const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  one_time: "bg-blue-100 text-blue-700",
  recurring: "bg-purple-100 text-purple-700",
};

export const EXPENSE_STATUS_COLORS: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  overdue: "bg-red-100 text-red-700",
  partial: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
};
