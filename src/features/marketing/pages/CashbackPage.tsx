import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Wallet,
  TrendingUp,
  Users,
  ArrowDownUp,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  CashbackRule,
  CashbackRuleStatus,
  CreateCashbackRulePayload,
} from "@/features/marketing/types/marketingTypes";
import cashbackData from "@/mocks/GET-marketing--cashback.json";
import { toast } from "sonner";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

// ─── Mock service ─────────────────────────────────────────────────────────────

function useCashbackRules() {
  const [rules, setRules] = useState<CashbackRule[]>(
    cashbackData.responseBody as CashbackRule[],
  );

  function addRule(payload: CreateCashbackRulePayload): CashbackRule {
    const newRule: CashbackRule = {
      id: `cb-${Date.now()}`,
      name: payload.name,
      percentage: payload.percentage,
      maxAmountCents: payload.maxAmountCents,
      minOrderCents: payload.minOrderCents,
      expirationDays: payload.expirationDays,
      status: "Ativa",
      totalDistributedCents: 0,
      totalRedeemedCents: 0,
      totalCustomers: 0,
      createdAt: new Date().toISOString(),
    };
    setRules((prev) => [newRule, ...prev]);
    return newRule;
  }

  function deleteRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  function toggleStatus(id: string) {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: (r.status === "Ativa"
                ? "Inativa"
                : "Ativa") as CashbackRuleStatus,
            }
          : r,
      ),
    );
  }

  return { rules, addRule, deleteRule, toggleStatus };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<CashbackRuleStatus, { label: string; cls: string }> =
  {
    Ativa: { label: "Ativa", cls: "bg-emerald-100 text-emerald-800" },
    Inativa: { label: "Inativa", cls: "bg-yellow-100 text-yellow-800" },
  };

function fmtDate(iso: string) {
  try {
    return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

function fmtCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function CashbackSummary({ rules }: { rules: CashbackRule[] }) {
  const totalDistributed = rules.reduce(
    (s, r) => s + r.totalDistributedCents,
    0,
  );
  const totalRedeemed = rules.reduce((s, r) => s + r.totalRedeemedCents, 0);
  const totalCustomers = rules.reduce((s, r) => s + r.totalCustomers, 0);
  const redemptionRate =
    totalDistributed > 0
      ? Math.round((totalRedeemed / totalDistributed) * 100)
      : 0;

  const items = [
    {
      label: "Total Distribuido",
      value: fmtCurrency(totalDistributed),
      icon: <Wallet size={16} />,
      color: "text-blue-600",
    },
    {
      label: "Total Resgatado",
      value: fmtCurrency(totalRedeemed),
      icon: <ArrowDownUp size={16} />,
      color: "text-emerald-600",
    },
    {
      label: "Taxa de Resgate",
      value: `${redemptionRate}%`,
      icon: <TrendingUp size={16} />,
      color: "text-violet-600",
    },
    {
      label: "Clientes Beneficiados",
      value: totalCustomers.toLocaleString("pt-BR"),
      icon: <Users size={16} />,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-card p-4 space-y-1"
        >
          <div className={item.color}>{item.icon}</div>
          <div className="text-xl font-bold text-foreground">{item.value}</div>
          <div className="text-xs text-muted-foreground">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────

interface CashbackModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateCashbackRulePayload) => void;
}

function CreateCashbackModal({ open, onClose, onCreate }: CashbackModalProps) {
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [expirationDays, setExpirationDays] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !percentage) {
      toast.error("Preencha os campos obrigatorios.");
      return;
    }
    onCreate({
      name,
      percentage: Number(percentage),
      maxAmountCents: maxAmount ? Math.round(Number(maxAmount) * 100) : null,
      minOrderCents: minOrder ? Math.round(Number(minOrder) * 100) : 0,
      expirationDays: expirationDays ? Number(expirationDays) : null,
    });
    toast.success("Regra de cashback criada com sucesso!");
    onClose();
    resetForm();
  }

  function resetForm() {
    setName("");
    setPercentage("");
    setMaxAmount("");
    setMinOrder("");
    setExpirationDays("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Criar Regra de Cashback</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Nome da Regra *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cashback Padrao"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Percentual (%) *
              </label>
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="5"
                min="0"
                max="100"
                step="0.5"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Maximo por Transacao (R$)
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="Ilimitado"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Pedido Minimo (R$)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="Sem minimo"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Expira em (dias)
              </label>
              <input
                type="number"
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
                placeholder="Nunca expira"
                min="1"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Criar Regra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Rule Row ─────────────────────────────────────────────────────────────────

function RuleRow({
  rule,
  onToggle,
  onDelete,
}: {
  rule: CashbackRule;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const badge = STATUS_BADGE[rule.status];
  const redemptionRate =
    rule.totalDistributedCents > 0
      ? Math.round((rule.totalRedeemedCents / rule.totalDistributedCents) * 100)
      : 0;

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{rule.name}</span>
          <span className="text-[11px] text-muted-foreground">
            Criada em {fmtDate(rule.createdAt)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-sm font-semibold text-foreground">
          {rule.percentage}%
        </span>
        {rule.maxAmountCents !== null && (
          <span className="block text-[11px] text-muted-foreground">
            max {fmtCurrency(rule.maxAmountCents)}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            badge.cls,
          )}
        >
          {badge.label}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="space-y-0.5">
          <span className="text-xs text-foreground font-medium">
            {fmtCurrency(rule.totalDistributedCents)}
          </span>
          <span className="block text-[11px] text-muted-foreground">
            {fmtCurrency(rule.totalRedeemedCents)} resgatado ({redemptionRate}%)
          </span>
        </div>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">
          {rule.totalCustomers.toLocaleString("pt-BR")} clientes
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">
          {rule.minOrderCents > 0
            ? fmtCurrency(rule.minOrderCents)
            : "Sem minimo"}
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">
          {rule.expirationDays !== null
            ? `${rule.expirationDays} dias`
            : "Nunca"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onToggle(rule.id)}
            className="rounded border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={rule.status === "Ativa" ? "Desativar" : "Ativar"}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            className="rounded border border-border p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Excluir"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CashbackPage() {
  const { rules, addRule, deleteRule, toggleStatus } = useCashbackRules();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CashbackRuleStatus | "all">(
    "all",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());

  const filtered = useMemo(
    () =>
      rules.filter((r) => {
        const matchSearch =
          search === "" || r.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || r.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [rules, search, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedRules = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function handleDelete(id: string) {
    deleteRule(id);
    toast.success("Regra de cashback excluida!");
  }

  function handleToggle(id: string) {
    toggleStatus(id);
    toast.success("Status da regra atualizado!");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cashback</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure regras de cashback para fidelizar clientes
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Criar Regra
        </button>
      </div>

      {/* Summary */}
      <CashbackSummary rules={rules} />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar regras de cashback..."
            className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              { value: "all", label: "Todas" },
              { value: "Ativa", label: "Ativas" },
              { value: "Inativa", label: "Inativas" },
            ] as { value: CashbackRuleStatus | "all"; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Regra
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                Cashback
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                Distribuido / Resgatado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                Clientes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                Pedido Min.
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                Expiracao
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Wallet size={28} className="opacity-30" />
                    <p className="text-sm">
                      Nenhuma regra de cashback encontrada.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedRules.map((rule) => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>

        <TablePagination
          page={page - 1}
          totalPages={totalPages}
          totalElements={filtered.length}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setDefaultPageSize(size);
            setPageSize(size);
            setPage(1);
          }}
          onFirst={() => setPage(1)}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onLast={() => setPage(totalPages)}
        />
      </div>

      {/* Create Modal */}
      <CreateCashbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={addRule}
      />
    </div>
  );
}
