import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  UserPlus,
  TrendingUp,
  DollarSign,
  Users,
  Copy,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type {
  Affiliate,
  AffiliateStatus,
  CreateAffiliatePayload,
} from "@/features/marketing/types/marketingTypes";
import affiliatesData from "@/mocks/GET-marketing--affiliates.json";
import { toast } from "sonner";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

// ─── Mock service ─────────────────────────────────────────────────────────────

function generateReferralCode(name: string): string {
  const base = name
    .split(" ")[0]
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
}

function useAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(
    affiliatesData.responseBody as unknown as Affiliate[],
  );

  function addAffiliate(payload: CreateAffiliatePayload): Affiliate {
    const newAffiliate: Affiliate = {
      id: `aff-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      referralCode: generateReferralCode(payload.name),
      commissionPercent: payload.commissionPercent,
      status: "Pendente",
      totalSalesCents: 0,
      totalCommissionCents: 0,
      totalPaidCents: 0,
      referralCount: 0,
      createdAt: new Date().toISOString(),
    };
    setAffiliates((prev) => [newAffiliate, ...prev]);
    return newAffiliate;
  }

  function deleteAffiliate(id: string) {
    setAffiliates((prev) => prev.filter((a) => a.id !== id));
  }

  function toggleStatus(id: string) {
    setAffiliates((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const next: AffiliateStatus =
          a.status === "Ativo" ? "Inativo" : "Ativo";
        return { ...a, status: next };
      }),
    );
  }

  return { affiliates, addAffiliate, deleteAffiliate, toggleStatus };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<AffiliateStatus, { label: string; cls: string }> = {
  Ativo: { label: "Ativo", cls: "bg-emerald-100 text-emerald-800" },
  Inativo: { label: "Inativo", cls: "bg-muted text-muted-foreground" },
  Pendente: { label: "Pendente", cls: "bg-yellow-100 text-yellow-800" },
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

function AffiliatesSummary({ affiliates }: { affiliates: Affiliate[] }) {
  const active = affiliates.filter((a) => a.status === "Ativo").length;
  const totalSales = affiliates.reduce((s, a) => s + a.totalSalesCents, 0);
  const totalCommission = affiliates.reduce(
    (s, a) => s + a.totalCommissionCents,
    0,
  );
  const totalReferrals = affiliates.reduce((s, a) => s + a.referralCount, 0);

  const items = [
    {
      label: "Afiliados Ativos",
      value: active.toString(),
      icon: <Users size={16} />,
      color: "text-emerald-600",
    },
    {
      label: "Vendas Indicadas",
      value: fmtCurrency(totalSales),
      icon: <TrendingUp size={16} />,
      color: "text-blue-600",
    },
    {
      label: "Comissoes Geradas",
      value: fmtCurrency(totalCommission),
      icon: <DollarSign size={16} />,
      color: "text-violet-600",
    },
    {
      label: "Total de Indicacoes",
      value: totalReferrals.toLocaleString("pt-BR"),
      icon: <UserPlus size={16} />,
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

interface AffiliateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateAffiliatePayload) => void;
}

function CreateAffiliateModal({
  open,
  onClose,
  onCreate,
}: AffiliateModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [commission, setCommission] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !commission) {
      toast.error("Preencha os campos obrigatorios.");
      return;
    }
    onCreate({
      name,
      email,
      phone,
      commissionPercent: Number(commission),
    });
    toast.success("Afiliado cadastrado com sucesso!");
    onClose();
    resetForm();
  }

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setCommission("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cadastrar Afiliado</h2>
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
              Nome Completo *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria Silva"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                E-mail *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@email.com"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Telefone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-1234"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Comissao (%) *
            </label>
            <input
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="10"
              min="0"
              max="100"
              step="0.5"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Um codigo de indicacao sera gerado automaticamente.
            </p>
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
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Affiliate Row ────────────────────────────────────────────────────────────

function AffiliateRow({
  affiliate,
  onToggle,
  onDelete,
}: {
  affiliate: Affiliate;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const badge = STATUS_BADGE[affiliate.status];
  const pendingPayout =
    affiliate.totalCommissionCents - affiliate.totalPaidCents;

  function handleCopyCode() {
    void navigator.clipboard.writeText(affiliate.referralCode);
    toast.success(`Codigo "${affiliate.referralCode}" copiado!`);
  }

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{affiliate.name}</span>
          <span className="text-[11px] text-muted-foreground">
            {affiliate.email} &middot; {fmtDate(affiliate.createdAt)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <button
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 font-mono text-xs font-bold text-foreground hover:bg-muted/80 transition-colors"
          title="Copiar codigo"
        >
          {affiliate.referralCode}
          <Copy size={11} className="text-muted-foreground" />
        </button>
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
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-sm font-semibold text-foreground">
          {affiliate.commissionPercent}%
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-xs text-muted-foreground">
          {affiliate.referralCount.toLocaleString("pt-BR")} indicacoes
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="space-y-0.5">
          <span className="text-xs text-foreground font-medium">
            {fmtCurrency(affiliate.totalSalesCents)}
          </span>
          <span className="block text-[11px] text-muted-foreground">
            {fmtCurrency(affiliate.totalCommissionCents)} comissao
          </span>
        </div>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="space-y-0.5">
          <span className="text-xs text-foreground font-medium">
            {fmtCurrency(affiliate.totalPaidCents)} pago
          </span>
          {pendingPayout > 0 && (
            <span className="block text-[11px] text-orange-600 font-medium">
              {fmtCurrency(pendingPayout)} pendente
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onToggle(affiliate.id)}
            className="rounded border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={affiliate.status === "Ativo" ? "Desativar" : "Ativar"}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(affiliate.id)}
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

export function AffiliatesPage() {
  const { affiliates, addAffiliate, deleteAffiliate, toggleStatus } =
    useAffiliates();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AffiliateStatus | "all">(
    "all",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());

  const filtered = useMemo(
    () =>
      affiliates.filter((a) => {
        const matchSearch =
          search === "" ||
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase()) ||
          a.referralCode.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || a.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [affiliates, search, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedAffiliates = useMemo(() => {
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
    deleteAffiliate(id);
    toast.success("Afiliado excluido com sucesso!");
  }

  function handleToggle(id: string) {
    toggleStatus(id);
    toast.success("Status do afiliado atualizado!");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Programa de Afiliados</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie afiliados e acompanhe indicacoes e comissoes
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Novo Afiliado
        </button>
      </div>

      {/* Summary */}
      <AffiliatesSummary affiliates={affiliates} />

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
            placeholder="Buscar por nome, email ou codigo..."
            className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              { value: "all", label: "Todos" },
              { value: "Ativo", label: "Ativos" },
              { value: "Pendente", label: "Pendentes" },
              { value: "Inativo", label: "Inativos" },
            ] as { value: AffiliateStatus | "all"; label: string }[]
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
                Afiliado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                Codigo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                Comissao
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                Indicacoes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                Vendas / Comissao
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                Pagamentos
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
                    <UserPlus size={28} className="opacity-30" />
                    <p className="text-sm">Nenhum afiliado encontrado.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedAffiliates.map((affiliate) => (
                <AffiliateRow
                  key={affiliate.id}
                  affiliate={affiliate}
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
      <CreateAffiliateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={addAffiliate}
      />
    </div>
  );
}
