import { useState, useMemo } from "react";
import {
  DollarSign,
  Hash,
  CalendarCheck,
  Calendar,
  TrendingDown,
  Eye,
  Pencil,
  Plus,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import {
  DataTableContainer,
  TableScroll,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyRow,
} from "@/components/shared/Table";
import { TablePagination } from "@/components/shared/TablePagination";
import { SkeletonRow } from "@/components/shared/SkeletonRow";
import { KpiWidgets } from "../components/KpiWidgets";
import { ExpenseSearchBar } from "../components/ExpenseSearchBar";
import { FilterBar } from "../components/FilterBar";
import { Drawer } from "../components/Drawer";
import {
  usePaidExpenses,
  usePaidExpenseKpis,
  useExpenseCategories,
} from "../api/useExpenses";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatShortDate } from "@/lib/utils/formatDate";
import {
  PAYMENT_METHOD_LABELS,
  type PaidExpenseFilters,
  type Expense,
  type PaymentMethod,
} from "../types/expenseTypes";
import { inputCls, Fieldset } from "@/components/shared/FormField";
import { useDisclosure } from "@/lib/hooks/useDisclosure";
import { ExpenseFormContent } from "./PendingExpensesTab";

const INITIAL_FILTERS: PaidExpenseFilters = {
  search: "",
  paymentDateFrom: "",
  paymentDateTo: "",
  categoryId: "",
  supplier: "",
  paymentMethod: "",
  amountMin: "",
  amountMax: "",
};

const COLS = 9;

export function PaidExpensesTab() {
  const [filters, setFilters] = useState<PaidExpenseFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const drawer = useDisclosure();
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "view",
  );
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const { data, isLoading } = usePaidExpenses(filters, page, pageSize);
  const { data: kpis, isLoading: kpisLoading } = usePaidExpenseKpis();
  const { data: categories } = useExpenseCategories();

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.paymentDateFrom || filters.paymentDateTo) c++;
    if (filters.categoryId) c++;
    if (filters.supplier) c++;
    if (filters.paymentMethod) c++;
    if (filters.amountMin || filters.amountMax) c++;
    return c;
  }, [filters]);

  const openCreate = () => {
    setSelectedExpense(null);
    setDrawerMode("create");
    drawer.open();
  };

  const openView = (expense: Expense) => {
    setSelectedExpense(expense);
    setDrawerMode("view");
    drawer.open();
  };

  const openEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setDrawerMode("edit");
    drawer.open();
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(0);
  };

  const updateFilter = <K extends keyof PaidExpenseFilters>(
    key: K,
    value: PaidExpenseFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const kpiCards = [
    {
      label: "Total Pago",
      value: kpis ? formatCurrency(kpis.totalPaidCents) : "—",
      icon: <DollarSign size={14} />,
      accent: "text-green-600",
    },
    {
      label: "Qtd. Pagas",
      value: kpis?.count ?? 0,
      icon: <Hash size={14} />,
    },
    {
      label: "Pago Hoje",
      value: kpis?.paidToday ?? 0,
      icon: <CalendarCheck size={14} />,
      accent: "text-blue-600",
    },
    {
      label: "Pago no Mês",
      value: kpis?.paidThisMonth ?? 0,
      icon: <Calendar size={14} />,
      accent: "text-purple-600",
    },
    {
      label: "Média por Despesa",
      value: kpis ? formatCurrency(kpis.averageCents) : "—",
      icon: <TrendingDown size={14} />,
    },
  ];

  return (
    <div className="space-y-4">
      <KpiWidgets cards={kpiCards} loading={kpisLoading} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <ExpenseSearchBar
            value={filters.search}
            onChange={(v) => updateFilter("search", v)}
            placeholder="Buscar despesa paga..."
          />
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus size={16} />
          Lançar Pagamento
        </Button>
      </div>

      <FilterBar onClear={clearFilters} activeCount={activeFilterCount}>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Pagamento De
          </label>
          <input
            type="date"
            value={filters.paymentDateFrom}
            onChange={(e) => updateFilter("paymentDateFrom", e.target.value)}
            className={inputCls(false, "mt-1 h-9")}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Pagamento Até
          </label>
          <input
            type="date"
            value={filters.paymentDateTo}
            onChange={(e) => updateFilter("paymentDateTo", e.target.value)}
            className={inputCls(false, "mt-1 h-9")}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Categoria
          </label>
          <select
            value={filters.categoryId}
            onChange={(e) => updateFilter("categoryId", e.target.value)}
            className={inputCls(false, "mt-1 h-9")}
          >
            <option value="">Todas</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Forma de Pagamento
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(e) =>
              updateFilter(
                "paymentMethod",
                e.target.value as PaymentMethod | "",
              )
            }
            className={inputCls(false, "mt-1 h-9")}
          >
            <option value="">Todas</option>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Fornecedor
          </label>
          <input
            type="text"
            value={filters.supplier}
            onChange={(e) => updateFilter("supplier", e.target.value)}
            className={inputCls(false, "mt-1 h-9")}
            placeholder="Buscar fornecedor..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Valor Mín. (R$)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filters.amountMin}
            onChange={(e) => updateFilter("amountMin", e.target.value)}
            className={inputCls(false, "mt-1 h-9")}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Valor Máx. (R$)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filters.amountMax}
            onChange={(e) => updateFilter("amountMax", e.target.value)}
            className={inputCls(false, "mt-1 h-9")}
          />
        </div>
      </FilterBar>

      <DataTableContainer>
        <TableScroll>
          <Table>
            <TableHeader>
              <TableRow className="text-left text-xs text-muted-foreground bg-muted/40">
                <TableHead>Descrição</TableHead>
                <TableHead>Conta Vinculada</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Valor Pago</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Data Pagamento</TableHead>
                <TableHead>Forma Pgto.</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={COLS} />
                ))
              ) : !data?.content.length ? (
                <TableEmptyRow colSpan={COLS}>
                  Nenhuma despesa paga encontrada.
                </TableEmptyRow>
              ) : (
                data.content.map((expense) => (
                  <TableRow
                    key={expense.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => openView(expense)}
                  >
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {expense.description}
                    </TableCell>
                    <TableCell>{expense.accountName}</TableCell>
                    <TableCell>{expense.categoryName}</TableCell>
                    <TableCell>{expense.supplier}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(
                        expense.paidAmountCents || expense.amountCents,
                      )}
                    </TableCell>
                    <TableCell>{formatShortDate(expense.dueDate)}</TableCell>
                    <TableCell>
                      {expense.paymentDate
                        ? formatShortDate(expense.paymentDate)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size={"icon-sm"}
                          onClick={(e) => {
                            e.stopPropagation();
                            openView(expense);
                          }}
                          aria-label="Visualizar"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size={"icon-sm"}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(expense);
                          }}
                          aria-label="Editar"
                        >
                          <Pencil size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableScroll>
        <TablePagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          totalElements={data?.totalElements}
          pageSize={pageSize}
          onFirst={() => setPage(0)}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
          onLast={() => setPage((data?.totalPages ?? 1) - 1)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(0);
          }}
        />
      </DataTableContainer>

      <PaidExpenseDrawer
        open={drawer.isOpen}
        onClose={drawer.close}
        mode={drawerMode}
        expense={selectedExpense}
        onSwitchToEdit={() => setDrawerMode("edit")}
      />
    </div>
  );
}

// ─── Drawer ─────────────────────────────────────────────────────────

interface PaidExpenseDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit" | "create";
  expense: Expense | null;
  onSwitchToEdit: () => void;
}

function PaidExpenseDrawer({
  open,
  onClose,
  mode,
  expense,
  onSwitchToEdit,
}: PaidExpenseDrawerProps) {
  const isView = mode === "view";
  const isCreate = mode === "create";
  const title = isCreate
    ? "Lançar Pagamento"
    : isView
      ? "Detalhes da Despesa Paga"
      : "Editar Despesa Paga";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      subtitle={isView && expense ? expense.description : undefined}
      footer={
        isView ? (
          <Button type="button" onClick={onSwitchToEdit}>
            <Pencil size={14} />
            Editar
          </Button>
        ) : undefined
      }
    >
      {isView && expense ? (
        <PaidExpenseViewContent expense={expense} />
      ) : (
        <ExpenseFormContent
          expense={isCreate ? null : expense}
          onClose={onClose}
          defaultStatus="paid"
        />
      )}
    </Drawer>
  );
}

// ─── View ───────────────────────────────────────────────────────────

function PaidExpenseViewContent({ expense }: { expense: Expense }) {
  return (
    <div className="space-y-6">
      <Fieldset legend="Informações da Despesa Paga">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow label="Descrição" value={expense.description} />
          <DetailRow label="Conta Vinculada" value={expense.accountName} />
          <DetailRow label="Categoria" value={expense.categoryName} />
          <DetailRow label="Fornecedor" value={expense.supplier} />
          <DetailRow
            label="Valor Pago"
            value={formatCurrency(
              expense.paidAmountCents || expense.amountCents,
            )}
          />
          <DetailRow
            label="Valor Original"
            value={formatCurrency(expense.amountCents)}
          />
          <DetailRow
            label="Vencimento"
            value={formatShortDate(expense.dueDate)}
          />
          <DetailRow
            label="Data de Pagamento"
            value={
              expense.paymentDate ? formatShortDate(expense.paymentDate) : "—"
            }
          />
          <DetailRow
            label="Forma de Pagamento"
            value={PAYMENT_METHOD_LABELS[expense.paymentMethod]}
          />
          <DetailRow
            label="Origem"
            value={expense.isRecurring ? "Recorrente" : "Avulsa"}
          />
        </div>
        {expense.notes && (
          <div className="mt-3">
            <DetailRow label="Observações" value={expense.notes} />
          </div>
        )}
      </Fieldset>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  );
}
