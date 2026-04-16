/**
 * React Query hooks for the Expenses feature.
 *
 * Each hook delegates to the mock service layer.
 * When switching to a real API, update only the service imports.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AccountFilters,
  PendingExpenseFilters,
  PaidExpenseFilters,
  ExpenseAccount,
  Expense,
} from "../types/expenseTypes";
import {
  fetchAccounts,
  fetchAccountById,
  fetchAccountKpis,
  saveAccount,
  fetchPendingExpenses,
  fetchPendingExpenseKpis,
  fetchPaidExpenses,
  fetchPaidExpenseKpis,
  fetchExpenseById,
  saveExpense,
  fetchCategories,
  fetchCostCenters,
} from "./expenseMockService";

// ─── Keys ───────────────────────────────────────────────────────────

const keys = {
  accounts: (filters: AccountFilters, page: number, size: number) =>
    ["expenses", "accounts", filters, page, size] as const,
  accountById: (id: string) => ["expenses", "accounts", id] as const,
  accountKpis: () => ["expenses", "accounts", "kpis"] as const,
  pending: (filters: PendingExpenseFilters, page: number, size: number) =>
    ["expenses", "pending", filters, page, size] as const,
  pendingKpis: () => ["expenses", "pending", "kpis"] as const,
  paid: (filters: PaidExpenseFilters, page: number, size: number) =>
    ["expenses", "paid", filters, page, size] as const,
  paidKpis: () => ["expenses", "paid", "kpis"] as const,
  expenseById: (id: string) => ["expenses", "expense", id] as const,
  categories: () => ["expenses", "categories"] as const,
  costCenters: () => ["expenses", "cost-centers"] as const,
};

// ─── Categories & Cost Centers ──────────────────────────────────────

export function useExpenseCategories() {
  return useQuery({
    queryKey: keys.categories(),
    queryFn: fetchCategories,
    staleTime: Infinity,
  });
}

export function useExpenseCostCenters() {
  return useQuery({
    queryKey: keys.costCenters(),
    queryFn: fetchCostCenters,
    staleTime: Infinity,
  });
}

// ─── Accounts ───────────────────────────────────────────────────────

export function useAccounts(
  filters: AccountFilters,
  page: number,
  size: number,
) {
  return useQuery({
    queryKey: keys.accounts(filters, page, size),
    queryFn: () => fetchAccounts(filters, page, size),
  });
}

export function useAccountById(id: string) {
  return useQuery({
    queryKey: keys.accountById(id),
    queryFn: () => fetchAccountById(id),
    enabled: !!id,
  });
}

export function useAccountKpis() {
  return useQuery({
    queryKey: keys.accountKpis(),
    queryFn: fetchAccountKpis,
  });
}

export function useSaveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ExpenseAccount>) => saveAccount(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses", "accounts"] });
    },
  });
}

// ─── Pending Expenses ───────────────────────────────────────────────

export function usePendingExpenses(
  filters: PendingExpenseFilters,
  page: number,
  size: number,
) {
  return useQuery({
    queryKey: keys.pending(filters, page, size),
    queryFn: () => fetchPendingExpenses(filters, page, size),
  });
}

export function usePendingExpenseKpis() {
  return useQuery({
    queryKey: keys.pendingKpis(),
    queryFn: fetchPendingExpenseKpis,
  });
}

// ─── Paid Expenses ──────────────────────────────────────────────────

export function usePaidExpenses(
  filters: PaidExpenseFilters,
  page: number,
  size: number,
) {
  return useQuery({
    queryKey: keys.paid(filters, page, size),
    queryFn: () => fetchPaidExpenses(filters, page, size),
  });
}

export function usePaidExpenseKpis() {
  return useQuery({
    queryKey: keys.paidKpis(),
    queryFn: fetchPaidExpenseKpis,
  });
}

// ─── Single Expense ─────────────────────────────────────────────────

export function useExpenseById(id: string) {
  return useQuery({
    queryKey: keys.expenseById(id),
    queryFn: () => fetchExpenseById(id),
    enabled: !!id,
  });
}

export function useSaveExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Expense>) => saveExpense(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
