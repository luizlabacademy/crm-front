/**
 * Mock service layer for the Expenses feature.
 *
 * Every function returns a Promise so the call-site (React Query hooks)
 * is already shaped for a real API swap — just replace the body.
 */

import type {
  ExpenseAccount,
  Expense,
  PageResponse,
  AccountFilters,
  PendingExpenseFilters,
  PaidExpenseFilters,
  AccountKpis,
  PendingExpenseKpis,
  PaidExpenseKpis,
  ExpenseCategory,
  CostCenter,
} from "../types/expenseTypes";

import accountsJson from "@/mocks/GET-expenses--accounts.json";
import pendingJson from "@/mocks/GET-expenses--pending.json";
import paidJson from "@/mocks/GET-expenses--paid.json";
import categoriesJson from "@/mocks/GET-expenses--categories.json";
import costCentersJson from "@/mocks/GET-expenses--cost-centers.json";

// Cast imported JSON to typed arrays
const allAccounts = (accountsJson.responseBody as unknown) as ExpenseAccount[];
const allPending = (pendingJson.responseBody as unknown) as Expense[];
const allPaid = (paidJson.responseBody as unknown) as Expense[];

// Simulated network delay
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ─── Helpers ────────────────────────────────────────────────────────

function paginate<T>(items: T[], page: number, size: number): PageResponse<T> {
  const totalElements = items.length;
  const totalPages = Math.max(Math.ceil(totalElements / size), 1);
  const start = page * size;
  return {
    content: items.slice(start, start + size),
    page,
    size,
    totalElements,
    totalPages,
  };
}

function matchSearch(text: string, search: string): boolean {
  if (!search) return true;
  const lower = search.toLowerCase();
  return text.toLowerCase().includes(lower);
}

function dateInRange(dateStr: string, from: string, to: string): boolean {
  if (!from && !to) return true;
  const d = dateStr.slice(0, 10);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function amountInRange(cents: number, min: string, max: string): boolean {
  if (min && cents < Number(min) * 100) return false;
  if (max && cents > Number(max) * 100) return false;
  return true;
}

// ─── Categories & Cost Centers ──────────────────────────────────────

export async function fetchCategories(): Promise<ExpenseCategory[]> {
  await delay(100);
  return categoriesJson.responseBody as ExpenseCategory[];
}

export async function fetchCostCenters(): Promise<CostCenter[]> {
  await delay(100);
  return costCentersJson.responseBody as CostCenter[];
}

// ─── Accounts ───────────────────────────────────────────────────────

export async function fetchAccounts(
  filters: AccountFilters,
  page: number,
  size: number,
): Promise<PageResponse<ExpenseAccount>> {
  await delay();
  let items = [...allAccounts];

  if (filters.search) {
    items = items.filter(
      (a) =>
        matchSearch(a.name, filters.search) ||
        matchSearch(a.categoryName, filters.search) ||
        matchSearch(a.supplier, filters.search),
    );
  }
  if (filters.categoryId)
    items = items.filter((a) => a.categoryId === filters.categoryId);
  if (filters.type) items = items.filter((a) => a.type === filters.type);
  if (filters.status) items = items.filter((a) => a.status === filters.status);
  if (filters.isRecurring === "yes")
    items = items.filter((a) => a.type === "recurring");
  if (filters.isRecurring === "no")
    items = items.filter((a) => a.type === "one_time");

  return paginate(items, page, size);
}

export async function fetchAccountById(
  id: string,
): Promise<ExpenseAccount | undefined> {
  await delay(200);
  return allAccounts.find((a) => a.id === id);
}

export async function fetchAccountKpis(): Promise<AccountKpis> {
  await delay(200);
  return {
    total: allAccounts.length,
    active: allAccounts.filter((a) => a.status === "active").length,
    recurring: allAccounts.filter((a) => a.type === "recurring").length,
    inactive: allAccounts.filter((a) => a.status === "inactive").length,
  };
}

export async function saveAccount(
  data: Partial<ExpenseAccount>,
): Promise<ExpenseAccount> {
  await delay(400);
  // In a real app, this would POST/PUT to the API
  const now = new Date().toISOString();
  const account: ExpenseAccount = {
    id: data.id || `acc-${Date.now()}`,
    name: data.name || "",
    categoryId: data.categoryId || "",
    categoryName: data.categoryName || "",
    description: data.description || "",
    supplier: data.supplier || "",
    defaultAmountCents: data.defaultAmountCents || 0,
    defaultPaymentMethod: data.defaultPaymentMethod || "pix",
    costCenterId: data.costCenterId || "",
    costCenterName: data.costCenterName || "",
    defaultDueDay: data.defaultDueDay || 1,
    status: data.status || "active",
    type: data.type || "one_time",
    recurrence: data.recurrence,
    createdAt: data.createdAt || now,
    updatedAt: now,
  };
  return account;
}

// ─── Pending Expenses ───────────────────────────────────────────────

export async function fetchPendingExpenses(
  filters: PendingExpenseFilters,
  page: number,
  size: number,
): Promise<PageResponse<Expense>> {
  await delay();
  let items = [...allPending];

  if (filters.search) {
    items = items.filter(
      (e) =>
        matchSearch(e.description, filters.search) ||
        matchSearch(e.accountName, filters.search) ||
        matchSearch(e.supplier, filters.search) ||
        matchSearch(e.categoryName, filters.search),
    );
  }
  if (filters.dueDateFrom || filters.dueDateTo) {
    items = items.filter((e) =>
      dateInRange(e.dueDate, filters.dueDateFrom, filters.dueDateTo),
    );
  }
  if (filters.categoryId)
    items = items.filter((e) => e.categoryId === filters.categoryId);
  if (filters.supplier)
    items = items.filter((e) => matchSearch(e.supplier, filters.supplier));
  if (filters.status) items = items.filter((e) => e.status === filters.status);
  if (filters.paymentMethod)
    items = items.filter((e) => e.paymentMethod === filters.paymentMethod);
  if (filters.amountMin || filters.amountMax) {
    items = items.filter((e) =>
      amountInRange(e.amountCents, filters.amountMin, filters.amountMax),
    );
  }

  return paginate(items, page, size);
}

export async function fetchPendingExpenseKpis(): Promise<PendingExpenseKpis> {
  await delay(200);
  const today = new Date().toISOString().slice(0, 10);
  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  return {
    totalAmountCents: allPending.reduce((s, e) => s + e.amountCents, 0),
    count: allPending.length,
    dueToday: allPending.filter((e) => e.dueDate.slice(0, 10) === today).length,
    overdue: allPending.filter((e) => e.status === "overdue").length,
    next7Days: allPending.filter(
      (e) => e.dueDate.slice(0, 10) >= today && e.dueDate.slice(0, 10) <= in7,
    ).length,
  };
}

// ─── Paid Expenses ──────────────────────────────────────────────────

export async function fetchPaidExpenses(
  filters: PaidExpenseFilters,
  page: number,
  size: number,
): Promise<PageResponse<Expense>> {
  await delay();
  let items = [...allPaid];

  if (filters.search) {
    items = items.filter(
      (e) =>
        matchSearch(e.description, filters.search) ||
        matchSearch(e.accountName, filters.search) ||
        matchSearch(e.supplier, filters.search) ||
        matchSearch(e.categoryName, filters.search),
    );
  }
  if (filters.paymentDateFrom || filters.paymentDateTo) {
    items = items.filter((e) =>
      dateInRange(
        e.paymentDate || "",
        filters.paymentDateFrom,
        filters.paymentDateTo,
      ),
    );
  }
  if (filters.categoryId)
    items = items.filter((e) => e.categoryId === filters.categoryId);
  if (filters.supplier)
    items = items.filter((e) => matchSearch(e.supplier, filters.supplier));
  if (filters.paymentMethod)
    items = items.filter((e) => e.paymentMethod === filters.paymentMethod);
  if (filters.amountMin || filters.amountMax) {
    items = items.filter((e) =>
      amountInRange(
        e.paidAmountCents || e.amountCents,
        filters.amountMin,
        filters.amountMax,
      ),
    );
  }

  return paginate(items, page, size);
}

export async function fetchPaidExpenseKpis(): Promise<PaidExpenseKpis> {
  await delay(200);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7); // YYYY-MM

  const paidThisMonth = allPaid.filter(
    (e) => e.paymentDate && e.paymentDate.startsWith(monthStart),
  );
  const paidToday = allPaid.filter(
    (e) => e.paymentDate && e.paymentDate.slice(0, 10) === today,
  );

  const totalPaidCents = allPaid.reduce(
    (s, e) => s + (e.paidAmountCents || e.amountCents),
    0,
  );

  return {
    totalPaidCents,
    count: allPaid.length,
    paidToday: paidToday.length,
    paidThisMonth: paidThisMonth.length,
    averageCents: allPaid.length
      ? Math.round(totalPaidCents / allPaid.length)
      : 0,
  };
}

export async function fetchExpenseById(
  id: string,
): Promise<Expense | undefined> {
  await delay(200);
  return [...allPending, ...allPaid].find((e) => e.id === id);
}

export async function saveExpense(data: Partial<Expense>): Promise<Expense> {
  await delay(400);
  const now = new Date().toISOString();
  const expense: Expense = {
    id: data.id || `exp-${Date.now()}`,
    description: data.description || "",
    accountId: data.accountId || "",
    accountName: data.accountName || "",
    categoryId: data.categoryId || "",
    categoryName: data.categoryName || "",
    supplier: data.supplier || "",
    amountCents: data.amountCents || 0,
    paidAmountCents: data.paidAmountCents,
    dueDate: data.dueDate || now.slice(0, 10),
    paymentDate: data.paymentDate,
    paymentMethod: data.paymentMethod || "pix",
    status: data.status || "open",
    isRecurring: data.isRecurring || false,
    notes: data.notes,
    createdAt: data.createdAt || now,
    updatedAt: now,
  };
  return expense;
}
