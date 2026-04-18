import { useState, useMemo } from "react";
import {
  ClipboardList,
  CheckCircle2,
  RefreshCw,
  XCircle,
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
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonRow } from "@/components/shared/SkeletonRow";
import { KpiWidgets } from "../components/KpiWidgets";
import { ExpenseSearchBar } from "../components/ExpenseSearchBar";
import { FilterBar } from "../components/FilterBar";
import { Drawer } from "../components/Drawer";
import {
  useAccounts,
  useAccountKpis,
  useExpenseCategories,
  useSaveAccount,
} from "../api/useExpenses";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_COLORS,
  ACCOUNT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  PERIODICITY_LABELS,
  type AccountFilters,
  type ExpenseAccount,
  type AccountType,
  type AccountStatus,
  type PaymentMethod,
  type Periodicity,
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

const INITIAL_FILTERS: AccountFilters = {
  search: "",
  categoryId: "",
  type: "",
  status: "",
  isRecurring: "",
};

const COLS = 5;

export function AccountsTab() {
  // ─── State ──────────────────────────────────────────────────────
  const [filters, setFilters] = useState<AccountFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const drawer = useDisclosure();
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "view",
  );
  const [selectedAccount, setSelectedAccount] = useState<ExpenseAccount | null>(
    null,
  );

  // ─── Data ───────────────────────────────────────────────────────
  const { data, isLoading } = useAccounts(filters, page, pageSize);
  const { data: kpis, isLoading: kpisLoading } = useAccountKpis();
  const { data: categories } = useExpenseCategories();

  // ─── Active filter count ────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.categoryId) c++;
    if (filters.type) c++;
    if (filters.status) c++;
    if (filters.isRecurring) c++;
    return c;
  }, [filters]);

  // ─── Handlers ───────────────────────────────────────────────────
  const openCreate = () => {
    setSelectedAccount(null);
    setDrawerMode("create");
    drawer.open();
  };

  const openView = (account: ExpenseAccount) => {
    setSelectedAccount(account);
    setDrawerMode("view");
    drawer.open();
  };

  const openEdit = (account: ExpenseAccount) => {
    setSelectedAccount(account);
    setDrawerMode("edit");
    drawer.open();
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(0);
  };

  const updateFilter = <K extends keyof AccountFilters>(
    key: K,
    value: AccountFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  // ─── KPI Cards ──────────────────────────────────────────────────
  const kpiCards = [
    {
      label: "Total de Contas",
      value: kpis?.total ?? 0,
      icon: <ClipboardList size={14} />,
    },
    {
      label: "Contas Ativas",
      value: kpis?.active ?? 0,
      icon: <CheckCircle2 size={14} />,
      accent: "text-green-600",
    },
    {
      label: "Recorrentes",
      value: kpis?.recurring ?? 0,
      icon: <RefreshCw size={14} />,
      accent: "text-purple-600",
    },
    {
      label: "Inativas",
      value: kpis?.inactive ?? 0,
      icon: <XCircle size={14} />,
      accent: "text-gray-500",
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <KpiWidgets cards={kpiCards} loading={kpisLoading} />

      {/* Search + Create */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <ExpenseSearchBar
            value={filters.search}
            onChange={(v) => updateFilter("search", v)}
            placeholder="Buscar conta, categoria ou fornecedor..."
          />
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus size={16} />
          Cadastrar Conta
        </Button>
      </div>

      {/* Filters */}
      <FilterBar onClear={clearFilters} activeCount={activeFilterCount}>
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
            Tipo
          </label>
          <select
            value={filters.type}
            onChange={(e) =>
              updateFilter("type", e.target.value as AccountType | "")
            }
            className={inputCls(false, "mt-1 h-9")}
          >
            <option value="">Todos</option>
            <option value="one_time">Avulsa</option>
            <option value="recurring">Recorrente</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              updateFilter("status", e.target.value as AccountStatus | "")
            }
            className={inputCls(false, "mt-1 h-9")}
          >
            <option value="">Todos</option>
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Recorrente
          </label>
          <select
            value={filters.isRecurring}
            onChange={(e) => updateFilter("isRecurring", e.target.value)}
            className={inputCls(false, "mt-1 h-9")}
          >
            <option value="">Todos</option>
            <option value="yes">Sim</option>
            <option value="no">Não</option>
          </select>
        </div>
      </FilterBar>

      {/* Table */}
      <DataTableContainer>
        <TableScroll>
          <Table>
            <TableHeader>
              <TableRow className="text-left text-xs text-muted-foreground bg-muted/40">
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
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
                  Nenhuma conta encontrada.
                </TableEmptyRow>
              ) : (
                data.content.map((account) => (
                  <TableRow
                    key={account.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => openView(account)}
                  >
                    <TableCell className="font-medium">
                      <div>{account.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{account.supplier || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <div>{account.categoryName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{ACCOUNT_TYPE_LABELS[account.type]}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div>
                        {account.defaultAmountCents
                          ? formatCurrency(account.defaultAmountCents)
                          : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {account.recurrence
                          ? PERIODICITY_LABELS[account.recurrence.periodicity]
                          : "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={account.status}
                        colorMap={ACCOUNT_STATUS_COLORS}
                        label={ACCOUNT_STATUS_LABELS[account.status]}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size={"icon-sm"}
                          onClick={(e) => {
                            e.stopPropagation();
                            openView(account);
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
                            openEdit(account);
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

      {/* Drawer */}
      <AccountDrawer
        open={drawer.isOpen}
        onClose={drawer.close}
        mode={drawerMode}
        account={selectedAccount}
        onSwitchToEdit={() => setDrawerMode("edit")}
      />
    </div>
  );
}

// ─── Account Drawer ─────────────────────────────────────────────────

interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit" | "create";
  account: ExpenseAccount | null;
  onSwitchToEdit: () => void;
}

function AccountDrawer({
  open,
  onClose,
  mode,
  account,
  onSwitchToEdit,
}: AccountDrawerProps) {
  const isView = mode === "view";
  const isCreate = mode === "create";
  const title = isCreate
    ? "Cadastrar Conta"
    : isView
      ? "Detalhes da Conta"
      : "Editar Conta";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      subtitle={isView && account ? account.name : undefined}
      footer={
        isView ? (
          <Button type="button" onClick={onSwitchToEdit}>
            <Pencil size={14} />
            Editar
          </Button>
        ) : undefined
      }
    >
      {isView && account ? (
        <AccountViewContent account={account} />
      ) : (
        <AccountFormContent
          account={isCreate ? null : account}
          onClose={onClose}
        />
      )}
    </Drawer>
  );
}

// ─── View Content ───────────────────────────────────────────────────

function AccountViewContent({ account }: { account: ExpenseAccount }) {
  return (
    <div className="space-y-6">
      <Fieldset legend="Informações Gerais">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow label="Nome" value={account.name} />
          <DetailRow label="Categoria" value={account.categoryName} />
          <DetailRow label="Fornecedor" value={account.supplier} />
          <DetailRow
            label="Valor Padrão"
            value={
              account.defaultAmountCents
                ? formatCurrency(account.defaultAmountCents)
                : "—"
            }
          />
          <DetailRow
            label="Forma de Pagamento"
            value={PAYMENT_METHOD_LABELS[account.defaultPaymentMethod]}
          />
          <DetailRow label="Centro de Custo" value={account.costCenterName} />
          <DetailRow
            label="Dia de Vencimento"
            value={String(account.defaultDueDay)}
          />
          <DetailRow
            label="Status"
            value={ACCOUNT_STATUS_LABELS[account.status]}
          />
          <DetailRow label="Tipo" value={ACCOUNT_TYPE_LABELS[account.type]} />
        </div>
        {account.description && (
          <div className="mt-3">
            <DetailRow label="Descrição" value={account.description} />
          </div>
        )}
      </Fieldset>

      {account.recurrence && (
        <Fieldset legend="Configuração de Recorrência">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow
              label="Periodicidade"
              value={PERIODICITY_LABELS[account.recurrence.periodicity]}
            />
            <DetailRow
              label="Data de Início"
              value={account.recurrence.startDate}
            />
            <DetailRow
              label="Data de Fim"
              value={account.recurrence.endDate || "Sem data de fim"}
            />
            <DetailRow
              label="Dia do Vencimento"
              value={String(account.recurrence.dueDay)}
            />
            <DetailRow
              label="Geração Automática"
              value={account.recurrence.autoGenerate ? "Sim" : "Não"}
            />
            {account.recurrence.notes && (
              <DetailRow label="Observações" value={account.recurrence.notes} />
            )}
          </div>
        </Fieldset>
      )}
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

// ─── Form Content ───────────────────────────────────────────────────

function AccountFormContent({
  account,
  onClose,
}: {
  account: ExpenseAccount | null;
  onClose: () => void;
}) {
  const { data: categories } = useExpenseCategories();
  const saveMutation = useSaveAccount();

  const [form, setForm] = useState({
    name: account?.name || "",
    categoryId: account?.categoryId || "",
    description: account?.description || "",
    supplier: account?.supplier || "",
    defaultAmountCents: account?.defaultAmountCents
      ? String(account.defaultAmountCents / 100)
      : "",
    defaultPaymentMethod:
      account?.defaultPaymentMethod || ("pix" as PaymentMethod),
    costCenterId: account?.costCenterId || "",
    defaultDueDay: account?.defaultDueDay ? String(account.defaultDueDay) : "1",
    status: account?.status || ("active" as AccountStatus),
    type: account?.type || ("one_time" as AccountType),
    // recurrence
    periodicity: account?.recurrence?.periodicity || ("monthly" as Periodicity),
    startDate: account?.recurrence?.startDate || "",
    endDate: account?.recurrence?.endDate || "",
    dueDay: account?.recurrence?.dueDay
      ? String(account.recurrence.dueDay)
      : "1",
    autoGenerate: account?.recurrence?.autoGenerate ?? true,
    recurrenceNotes: account?.recurrence?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isRecurring = form.type === "recurring";

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.categoryId) newErrors.categoryId = "Categoria é obrigatória";
    if (!form.supplier.trim()) newErrors.supplier = "Fornecedor é obrigatório";
    if (isRecurring && !form.startDate)
      newErrors.startDate = "Data de início é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const categoryName =
      categories?.find((c) => c.id === form.categoryId)?.name || "";

    await saveMutation.mutateAsync({
      id: account?.id,
      name: form.name,
      categoryId: form.categoryId,
      categoryName,
      description: form.description,
      supplier: form.supplier,
      defaultAmountCents: form.defaultAmountCents
        ? Math.round(Number(form.defaultAmountCents) * 100)
        : 0,
      defaultPaymentMethod: form.defaultPaymentMethod,
      costCenterId: form.costCenterId,
      costCenterName: "",
      defaultDueDay: Number(form.defaultDueDay) || 1,
      status: form.status,
      type: form.type,
      recurrence: isRecurring
        ? {
            periodicity: form.periodicity,
            startDate: form.startDate,
            endDate: form.endDate || undefined,
            dueDay: Number(form.dueDay) || 1,
            autoGenerate: form.autoGenerate,
            notes: form.recurrenceNotes || undefined,
          }
        : undefined,
    });

    toast.success(
      account ? "Conta atualizada com sucesso." : "Conta criada com sucesso.",
    );
    onClose();
  };

  return (
    <div className="space-y-6">
      <Fieldset legend="Informações Gerais">
        <Grid cols={1} className="sm:grid-cols-2">
          <div>
            <Label htmlFor="acc-name" required>
              Nome da Conta
            </Label>
            <input
              id="acc-name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputCls(!!errors.name, "mt-1")}
            />
            <FieldError message={errors.name} />
          </div>
          <div>
            <Label htmlFor="acc-category" required>
              Categoria
            </Label>
            <select
              id="acc-category"
              value={form.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              className={inputCls(!!errors.categoryId, "mt-1")}
            >
              <option value="">Selecione...</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.categoryId} />
          </div>
          <div>
            <Label htmlFor="acc-supplier" required>
              Fornecedor Favorecido
            </Label>
            <input
              id="acc-supplier"
              value={form.supplier}
              onChange={(e) => updateField("supplier", e.target.value)}
              className={inputCls(!!errors.supplier, "mt-1")}
            />
            <FieldError message={errors.supplier} />
          </div>
          <div>
            <Label htmlFor="acc-amount">Valor Padrão (R$)</Label>
            <input
              id="acc-amount"
              type="number"
              step="0.01"
              min="0"
              value={form.defaultAmountCents}
              onChange={(e) =>
                updateField("defaultAmountCents", e.target.value)
              }
              className={inputCls(false, "mt-1")}
            />
          </div>
          <div>
            <Label htmlFor="acc-payment">Forma de Pagamento Padrão</Label>
            <select
              id="acc-payment"
              value={form.defaultPaymentMethod}
              onChange={(e) =>
                updateField("defaultPaymentMethod", e.target.value)
              }
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
            <Label htmlFor="acc-dueday">Dia de Vencimento Padrão</Label>
            <input
              id="acc-dueday"
              type="number"
              min="1"
              max="31"
              value={form.defaultDueDay}
              onChange={(e) => updateField("defaultDueDay", e.target.value)}
              className={inputCls(false, "mt-1")}
            />
          </div>
          <div>
            <Label htmlFor="acc-status">Status</Label>
            <select
              id="acc-status"
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className={inputCls(false, "mt-1")}
            >
              <option value="active">Ativa</option>
              <option value="inactive">Inativa</option>
            </select>
          </div>
          <div>
            <Label htmlFor="acc-type">Tipo</Label>
            <select
              id="acc-type"
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className={inputCls(false, "mt-1")}
            >
              <option value="one_time">Avulsa</option>
              <option value="recurring">Recorrente</option>
            </select>
          </div>
        </Grid>
        <div className="mt-3">
          <Label htmlFor="acc-desc">Descrição</Label>
          <textarea
            id="acc-desc"
            rows={2}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={inputCls(false, "mt-1 min-h-16 resize-y")}
          />
        </div>
      </Fieldset>

      {isRecurring && (
        <Fieldset legend="Configuração de Recorrência">
          <Grid cols={1} className="sm:grid-cols-2">
            <div>
              <Label htmlFor="acc-period">Periodicidade</Label>
              <select
                id="acc-period"
                value={form.periodicity}
                onChange={(e) => updateField("periodicity", e.target.value)}
                className={inputCls(false, "mt-1")}
              >
                {Object.entries(PERIODICITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="acc-start" required>
                Data de Início
              </Label>
              <input
                id="acc-start"
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className={inputCls(!!errors.startDate, "mt-1")}
              />
              <FieldError message={errors.startDate} />
            </div>
            <div>
              <Label htmlFor="acc-end">Data de Fim (Opcional)</Label>
              <input
                id="acc-end"
                type="date"
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className={inputCls(false, "mt-1")}
              />
            </div>
            <div>
              <Label htmlFor="acc-rec-dueday">Dia do Vencimento</Label>
              <input
                id="acc-rec-dueday"
                type="number"
                min="1"
                max="31"
                value={form.dueDay}
                onChange={(e) => updateField("dueDay", e.target.value)}
                className={inputCls(false, "mt-1")}
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                id="acc-autogen"
                type="checkbox"
                checked={form.autoGenerate}
                onChange={(e) => updateField("autoGenerate", e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="acc-autogen">Geração Automática</Label>
            </div>
          </Grid>
          <div className="mt-3">
            <Label htmlFor="acc-rec-notes">Observações</Label>
            <textarea
              id="acc-rec-notes"
              rows={2}
              value={form.recurrenceNotes}
              onChange={(e) => updateField("recurrenceNotes", e.target.value)}
              className={inputCls(false, "mt-1 min-h-16 resize-y")}
            />
          </div>
        </Fieldset>
      )}

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
          {account ? "Salvar Alterações" : "Criar Conta"}
        </Button>
      </div>
    </div>
  );
}
