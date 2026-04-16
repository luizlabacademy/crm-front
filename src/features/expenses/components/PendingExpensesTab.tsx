import { useState, useMemo } from "react";
import {
  DollarSign,
  Hash,
  Clock,
  AlertTriangle,
  Calendar,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
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
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonRow } from "@/components/shared/SkeletonRow";
import { KpiWidgets } from "../components/KpiWidgets";
import { ExpenseSearchBar } from "../components/ExpenseSearchBar";
import { FilterBar } from "../components/FilterBar";
import { Drawer } from "../components/Drawer";
import {
  usePendingExpenses,
  usePendingExpenseKpis,
  useExpenseCategories,
  useSaveExpense,
} from "../api/useExpenses";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatShortDate } from "@/lib/utils/formatDate";
import {
  EXPENSE_STATUS_LABELS,
  EXPENSE_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  type PendingExpenseFilters,
  type Expense,
  type ExpenseStatus,
  type PaymentMethod,
} from "../types/expenseTypes";
import {
  inputCls,
  Label,
  FieldError,
  Fieldset,
} from "@/components/shared/FormField";
import { Grid } from "@/components/shared/Grid";
import { Divider } from "@/components/shared/Divider";
import { useDisclosure } from "@/lib/hooks/useDisclosure";
import { toast } from "sonner";

const INITIAL_FILTERS: PendingExpenseFilters = {
  search: "",
  dueDateFrom: "",
  dueDateTo: "",
  categoryId: "",
  supplier: "",
  status: "",
  paymentMethod: "",
  amountMin: "",
  amountMax: "",
};

const COLS = 9;

export function PendingExpensesTab() {
  const [filters, setFilters] =
    useState<PendingExpenseFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const drawer = useDisclosure();
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "view",
  );
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const { data, isLoading } = usePendingExpenses(filters, page, pageSize);
  const { data: kpis, isLoading: kpisLoading } = usePendingExpenseKpis();
  const { data: categories } = useExpenseCategories();

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.dueDateFrom || filters.dueDateTo) c++;
    if (filters.categoryId) c++;
    if (filters.supplier) c++;
    if (filters.status) c++;
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

  const updateFilter = <K extends keyof PendingExpenseFilters>(
    key: K,
    value: PendingExpenseFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const kpiCards = [
    {
      label: "Total em Aberto",
      value: kpis ? formatCurrency(kpis.totalAmountCents) : "—",
      icon: <DollarSign size={14} />,
      accent: "text-yellow-600",
    },
    {
      label: "Qtd. em Aberto",
      value: kpis?.count ?? 0,
      icon: <Hash size={14} />,
    },
    {
      label: "Vencendo Hoje",
      value: kpis?.dueToday ?? 0,
      icon: <Clock size={14} />,
      accent: "text-blue-600",
    },
    {
      label: "Vencidas",
      value: kpis?.overdue ?? 0,
      icon: <AlertTriangle size={14} />,
      accent: "text-red-600",
    },
    {
      label: "Próximos 7 Dias",
      value: kpis?.next7Days ?? 0,
      icon: <Calendar size={14} />,
      accent: "text-purple-600",
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
            placeholder="Buscar despesa, conta ou fornecedor..."
          />
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus size={16} />
          Lançar Conta a Pagar
        </Button>
      </div>

      <FilterBar onClear={clearFilters} activeCount={activeFilterCount}>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Vencimento De
          </label>
          <input
            type="date"
            value={filters.dueDateFrom}
            onChange={(e) => updateFilter("dueDateFrom", e.target.value)}
            className={inputCls(false, "mt-1 h-9")}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Vencimento Até
          </label>
          <input
            type="date"
            value={filters.dueDateTo}
            onChange={(e) => updateFilter("dueDateTo", e.target.value)}
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
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              updateFilter("status", e.target.value as ExpenseStatus | "")
            }
            className={inputCls(false, "mt-1 h-9")}
          >
            <option value="">Todos</option>
            <option value="open">Em aberto</option>
            <option value="overdue">Vencida</option>
            <option value="partial">Parcial</option>
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
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
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
                  Nenhuma despesa a pagar encontrada.
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
                      {formatCurrency(expense.amountCents)}
                    </TableCell>
                    <TableCell>{formatShortDate(expense.dueDate)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={expense.status}
                        colorMap={EXPENSE_STATUS_COLORS}
                        label={EXPENSE_STATUS_LABELS[expense.status]}
                      />
                    </TableCell>
                    <TableCell>
                      {expense.isRecurring ? (
                        <span className="inline-flex items-center gap-1 text-xs text-purple-600">
                          <RefreshCw size={12} /> Recorrente
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Avulsa
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            openView(expense);
                          }}
                          aria-label="Visualizar"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(expense);
                          }}
                          aria-label="Editar"
                        >
                          <Pencil size={14} />
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

      <PendingExpenseDrawer
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

interface PendingExpenseDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit" | "create";
  expense: Expense | null;
  onSwitchToEdit: () => void;
}

function PendingExpenseDrawer({
  open,
  onClose,
  mode,
  expense,
  onSwitchToEdit,
}: PendingExpenseDrawerProps) {
  const isView = mode === "view";
  const isCreate = mode === "create";
  const title = isCreate
    ? "Lançar Conta a Pagar"
    : isView
      ? "Detalhes da Despesa"
      : "Editar Despesa";

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
        <ExpenseViewContent expense={expense} />
      ) : (
        <ExpenseFormContent
          expense={isCreate ? null : expense}
          onClose={onClose}
          defaultStatus="open"
        />
      )}
    </Drawer>
  );
}

// ─── View ───────────────────────────────────────────────────────────

function ExpenseViewContent({ expense }: { expense: Expense }) {
  return (
    <div className="space-y-6">
      <Fieldset legend="Informações da Despesa">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow label="Descrição" value={expense.description} />
          <DetailRow label="Conta Vinculada" value={expense.accountName} />
          <DetailRow label="Categoria" value={expense.categoryName} />
          <DetailRow label="Fornecedor" value={expense.supplier} />
          <DetailRow
            label="Valor"
            value={formatCurrency(expense.amountCents)}
          />
          {expense.paidAmountCents !== undefined && (
            <DetailRow
              label="Valor Pago"
              value={formatCurrency(expense.paidAmountCents)}
            />
          )}
          <DetailRow
            label="Vencimento"
            value={formatShortDate(expense.dueDate)}
          />
          <DetailRow
            label="Forma de Pagamento"
            value={PAYMENT_METHOD_LABELS[expense.paymentMethod]}
          />
          <DetailRow
            label="Status"
            value={EXPENSE_STATUS_LABELS[expense.status]}
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

// ─── Form ───────────────────────────────────────────────────────────

export function ExpenseFormContent({
  expense,
  onClose,
  defaultStatus = "open",
}: {
  expense: Expense | null;
  onClose: () => void;
  defaultStatus?: ExpenseStatus;
}) {
  const { data: categories } = useExpenseCategories();
  const saveMutation = useSaveExpense();

  const [form, setForm] = useState({
    description: expense?.description || "",
    accountName: expense?.accountName || "",
    categoryId: expense?.categoryId || "",
    supplier: expense?.supplier || "",
    amountCents: expense?.amountCents ? String(expense.amountCents / 100) : "",
    paidAmountCents: expense?.paidAmountCents
      ? String(expense.paidAmountCents / 100)
      : "",
    dueDate: expense?.dueDate || "",
    paymentDate: expense?.paymentDate || "",
    paymentMethod: expense?.paymentMethod || ("pix" as PaymentMethod),
    status: expense?.status || defaultStatus,
    isRecurring: expense?.isRecurring ?? false,
    notes: expense?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.description.trim()) e.description = "Descrição é obrigatória";
    if (!form.supplier.trim()) e.supplier = "Fornecedor é obrigatório";
    if (!form.amountCents) e.amountCents = "Valor é obrigatório";
    if (!form.dueDate) e.dueDate = "Data de vencimento é obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const categoryName =
      categories?.find((c) => c.id === form.categoryId)?.name || "";

    await saveMutation.mutateAsync({
      id: expense?.id,
      description: form.description,
      accountName: form.accountName,
      categoryId: form.categoryId,
      categoryName,
      supplier: form.supplier,
      amountCents: Math.round(Number(form.amountCents) * 100),
      paidAmountCents: form.paidAmountCents
        ? Math.round(Number(form.paidAmountCents) * 100)
        : undefined,
      dueDate: form.dueDate,
      paymentDate: form.paymentDate || undefined,
      paymentMethod: form.paymentMethod,
      status: form.status as ExpenseStatus,
      isRecurring: form.isRecurring,
      notes: form.notes || undefined,
    });

    toast.success(expense ? "Despesa atualizada." : "Despesa criada.");
    onClose();
  };

  return (
    <div className="space-y-6">
      <Fieldset legend="Dados da Despesa">
        <Grid cols={1} className="sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="exp-desc" required>
              Descrição
            </Label>
            <input
              id="exp-desc"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={inputCls(!!errors.description, "mt-1")}
            />
            <FieldError message={errors.description} />
          </div>
          <div>
            <Label htmlFor="exp-account">Conta Vinculada</Label>
            <input
              id="exp-account"
              value={form.accountName}
              onChange={(e) => updateField("accountName", e.target.value)}
              className={inputCls(false, "mt-1")}
            />
          </div>
          <div>
            <Label htmlFor="exp-category">Categoria</Label>
            <select
              id="exp-category"
              value={form.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              className={inputCls(false, "mt-1")}
            >
              <option value="">Selecione...</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="exp-supplier" required>
              Fornecedor
            </Label>
            <input
              id="exp-supplier"
              value={form.supplier}
              onChange={(e) => updateField("supplier", e.target.value)}
              className={inputCls(!!errors.supplier, "mt-1")}
            />
            <FieldError message={errors.supplier} />
          </div>
          <div>
            <Label htmlFor="exp-amount" required>
              Valor (R$)
            </Label>
            <input
              id="exp-amount"
              type="number"
              step="0.01"
              min="0"
              value={form.amountCents}
              onChange={(e) => updateField("amountCents", e.target.value)}
              className={inputCls(!!errors.amountCents, "mt-1")}
            />
            <FieldError message={errors.amountCents} />
          </div>
          <div>
            <Label htmlFor="exp-due" required>
              Vencimento
            </Label>
            <input
              id="exp-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value)}
              className={inputCls(!!errors.dueDate, "mt-1")}
            />
            <FieldError message={errors.dueDate} />
          </div>
          <div>
            <Label htmlFor="exp-pay-method">Forma de Pagamento</Label>
            <select
              id="exp-pay-method"
              value={form.paymentMethod}
              onChange={(e) => updateField("paymentMethod", e.target.value)}
              className={inputCls(false, "mt-1")}
            >
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="exp-status">Status</Label>
            <select
              id="exp-status"
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className={inputCls(false, "mt-1")}
            >
              <option value="open">Em aberto</option>
              <option value="overdue">Vencida</option>
              <option value="partial">Parcial</option>
              <option value="paid">Paga</option>
            </select>
          </div>
          {(form.status === "partial" || form.status === "paid") && (
            <>
              <div>
                <Label htmlFor="exp-paid-amount">Valor Pago (R$)</Label>
                <input
                  id="exp-paid-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.paidAmountCents}
                  onChange={(e) =>
                    updateField("paidAmountCents", e.target.value)
                  }
                  className={inputCls(false, "mt-1")}
                />
              </div>
              <div>
                <Label htmlFor="exp-pay-date">Data de Pagamento</Label>
                <input
                  id="exp-pay-date"
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => updateField("paymentDate", e.target.value)}
                  className={inputCls(false, "mt-1")}
                />
              </div>
            </>
          )}
        </Grid>
        <div className="mt-3">
          <Label htmlFor="exp-notes">Observações</Label>
          <textarea
            id="exp-notes"
            rows={2}
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className={inputCls(false, "mt-1 min-h-16 resize-y")}
          />
        </div>
      </Fieldset>

      <Divider />

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending && (
            <RefreshCw size={14} className="animate-spin" />
          )}
          {expense ? "Salvar Alterações" : "Criar Despesa"}
        </Button>
      </div>
    </div>
  );
}
