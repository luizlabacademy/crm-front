import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Ticket,
  Copy,
  Percent,
  DollarSign,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  Coupon,
  CouponType,
  CouponStatus,
  CreateCouponPayload,
} from "@/features/marketing/types/marketingTypes";
import couponsData from "@/mocks/GET-marketing--coupons.json";
import { toast } from "sonner";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

// ─── Mock service ─────────────────────────────────────────────────────────────

function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>(couponsData.responseBody as unknown as Coupon[]);

  function addCoupon(payload: CreateCouponPayload): Coupon {
    const newCoupon: Coupon = {
      id: `cup-${Date.now()}`,
      code: payload.code.toUpperCase(),
      description: payload.description,
      type: payload.type,
      value: payload.value,
      minOrderCents: payload.minOrderCents,
      maxUses: payload.maxUses,
      usedCount: 0,
      maxUsesPerCustomer: payload.maxUsesPerCustomer,
      status: "Ativo",
      startsAt: payload.startsAt,
      expiresAt: payload.expiresAt,
      createdAt: new Date().toISOString(),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    return newCoupon;
  }

  function deleteCoupon(id: string) {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleStatus(id: string) {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status:
                c.status === "Ativo"
                  ? ("Inativo" as CouponStatus)
                  : ("Ativo" as CouponStatus),
            }
          : c,
      ),
    );
  }

  return { coupons, addCoupon, deleteCoupon, toggleStatus };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<CouponStatus, { label: string; cls: string }> = {
  Ativo: { label: "Ativo", cls: "bg-emerald-100 text-emerald-800" },
  Expirado: { label: "Expirado", cls: "bg-muted text-muted-foreground" },
  Inativo: { label: "Inativo", cls: "bg-yellow-100 text-yellow-800" },
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

function fmtDiscount(coupon: Coupon) {
  return coupon.type === "percentage"
    ? `${coupon.value}%`
    : fmtCurrency(coupon.value);
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function CouponsSummary({ coupons }: { coupons: Coupon[] }) {
  const active = coupons.filter((c) => c.status === "Ativo").length;
  const totalUsed = coupons.reduce((s, c) => s + c.usedCount, 0);
  const avgDiscount =
    coupons.length > 0
      ? Math.round(
          coupons
            .filter((c) => c.type === "percentage")
            .reduce((s, c) => s + c.value, 0) /
            Math.max(1, coupons.filter((c) => c.type === "percentage").length),
        )
      : 0;

  const items = [
    {
      label: "Cupons Ativos",
      value: active.toString(),
      icon: <Ticket size={16} />,
      color: "text-emerald-600",
    },
    {
      label: "Total Utilizados",
      value: totalUsed.toLocaleString("pt-BR"),
      icon: <Copy size={16} />,
      color: "text-blue-600",
    },
    {
      label: "Desconto Medio (%)",
      value: `${avgDiscount}%`,
      icon: <Percent size={16} />,
      color: "text-violet-600",
    },
    {
      label: "Total de Cupons",
      value: coupons.length.toString(),
      icon: <DollarSign size={16} />,
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

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

interface CouponModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateCouponPayload) => void;
}

function CreateCouponModal({ open, onClose, onCreate }: CouponModalProps) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CouponType>("percentage");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || !value || !startsAt || !expiresAt) {
      toast.error("Preencha os campos obrigatorios.");
      return;
    }
    onCreate({
      code: code.toUpperCase(),
      description,
      type,
      value:
        type === "percentage" ? Number(value) : Math.round(Number(value) * 100),
      minOrderCents: minOrder ? Math.round(Number(minOrder) * 100) : 0,
      maxUses: maxUses ? Number(maxUses) : null,
      maxUsesPerCustomer: maxUsesPerCustomer
        ? Number(maxUsesPerCustomer)
        : null,
      startsAt: new Date(startsAt).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
    });
    toast.success("Cupom criado com sucesso!");
    onClose();
    resetForm();
  }

  function resetForm() {
    setCode("");
    setDescription("");
    setType("percentage");
    setValue("");
    setMinOrder("");
    setMaxUses("");
    setMaxUsesPerCustomer("");
    setStartsAt("");
    setExpiresAt("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Criar Cupom</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Codigo *
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="BEMVINDO10"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CouponType)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Descricao
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="10% de desconto para novos clientes"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                {type === "percentage" ? "Valor (%) *" : "Valor (R$) *"}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "percentage" ? "10" : "25.00"}
                min="0"
                step={type === "percentage" ? "1" : "0.01"}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Pedido Minimo (R$)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="50.00"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Maximo de Usos
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Ilimitado"
                min="0"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Max. por Cliente
              </label>
              <input
                type="number"
                value={maxUsesPerCustomer}
                onChange={(e) => setMaxUsesPerCustomer(e.target.value)}
                placeholder="Ilimitado"
                min="0"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Inicio *
              </label>
              <input
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Expiracao *
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
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
              Criar Cupom
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Coupon Row ───────────────────────────────────────────────────────────────

function CouponRow({
  coupon,
  onToggle,
  onDelete,
}: {
  coupon: Coupon;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const badge = STATUS_BADGE[coupon.status];
  const usagePercent =
    coupon.maxUses !== null
      ? Math.round((coupon.usedCount / coupon.maxUses) * 100)
      : null;

  function handleCopyCode() {
    void navigator.clipboard.writeText(coupon.code);
    toast.success(`Codigo "${coupon.code}" copiado!`);
  }

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 font-mono text-xs font-bold text-foreground hover:bg-muted/80 transition-colors"
            title="Copiar codigo"
          >
            {coupon.code}
            <Copy size={11} className="text-muted-foreground" />
          </button>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground max-w-[200px] truncate">
          {coupon.description}
        </p>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
          {coupon.type === "percentage" ? (
            <Percent size={12} className="text-violet-500" />
          ) : (
            <DollarSign size={12} className="text-emerald-500" />
          )}
          {fmtDiscount(coupon)}
        </span>
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
          <span className="text-xs text-muted-foreground">
            {coupon.usedCount.toLocaleString("pt-BR")}
            {coupon.maxUses !== null &&
              ` / ${coupon.maxUses.toLocaleString("pt-BR")}`}
          </span>
          {usagePercent !== null && (
            <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, usagePercent)}%` }}
              />
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">
          {coupon.minOrderCents > 0
            ? fmtCurrency(coupon.minOrderCents)
            : "Sem minimo"}
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="text-xs text-muted-foreground">
          <div>{fmtDate(coupon.startsAt)}</div>
          <div>ate {fmtDate(coupon.expiresAt)}</div>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onToggle(coupon.id)}
            className="rounded border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={coupon.status === "Ativo" ? "Desativar" : "Ativar"}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(coupon.id)}
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

export function CouponsPage() {
  const { coupons, addCoupon, deleteCoupon, toggleStatus } = useCoupons();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CouponStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());

  const filtered = useMemo(
    () =>
      coupons.filter((c) => {
        const matchSearch =
          search === "" ||
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || c.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [coupons, search, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedCoupons = useMemo(() => {
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
    deleteCoupon(id);
    toast.success("Cupom excluido com sucesso!");
  }

  function handleToggle(id: string) {
    toggleStatus(id);
    toast.success("Status do cupom atualizado!");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cupons de Desconto</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie cupons promocionais e descontos
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Criar Cupom
        </button>
      </div>

      {/* Summary */}
      <CouponsSummary coupons={coupons} />

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
            placeholder="Buscar por codigo ou descricao..."
            className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              { value: "all", label: "Todos" },
              { value: "Ativo", label: "Ativos" },
              { value: "Inativo", label: "Inativos" },
              { value: "Expirado", label: "Expirados" },
            ] as { value: CouponStatus | "all"; label: string }[]
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
                Codigo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                Desconto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                Usos
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                Pedido Min.
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                Validade
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Ticket size={28} className="opacity-30" />
                    <p className="text-sm">Nenhum cupom encontrado.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedCoupons.map((coupon) => (
                <CouponRow
                  key={coupon.id}
                  coupon={coupon}
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
      <CreateCouponModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={addCoupon}
      />
    </div>
  );
}
