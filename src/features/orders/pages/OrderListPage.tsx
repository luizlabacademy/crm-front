import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, RefreshCw, Search, X, Zap } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  useCatalogItems,
  useOrders,
  useDeleteOrder,
} from "@/features/orders/api/useOrders";
import { useCustomers } from "@/features/customers/api/useCustomers";
import { ORDER_STATUS_COLORS } from "@/features/orders/types/orderTypes";
import { formatDateTime } from "@/lib/utils/formatDate";
import { formatCurrencyCode } from "@/lib/utils/formatCurrency";
import { SkeletonRow } from "@/components/shared/SkeletonRow";
import { FilterBar } from "@/features/expenses/components/FilterBar";
import { useTenantsSelector } from "@/lib/api/useTenants";
import { formatShortDate } from "@/lib/utils/formatDate";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import {
  QuoteComposerOverlay,
  type QuoteFinalizePayload,
} from "@/features/orders/components/QuoteComposerOverlay";
import catalogMock from "@/mocks/conversations/get-catalog-items.json";
import contactsMock from "@/mocks/conversations/get-contacts.json";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

type OrdersViewMode = "quotes" | "sales";

interface OrderListPageProps {
  viewMode?: OrdersViewMode;
}

export function OrderListPage({ viewMode = "quotes" }: OrderListPageProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());
  const [draftFilters, setDraftFilters] = useState({
    q: "",
    tenantId: "",
    customerId: "",
    userId: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [filters, setFilters] = useState({
    q: "",
    tenantId: "",
    customerId: "",
    userId: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [composerCustomerId, setComposerCustomerId] = useState<number | null>(
    null,
  );
  const [composerTitle, setComposerTitle] = useState("Novo Orçamento");
  const [invoiceOrderId, setInvoiceOrderId] = useState<number | null>(null);

  const isQuotesView = viewMode === "quotes";
  const fixedStatus = isQuotesView ? "DRAFT" : "CONFIRMED";

  const tenantId = filters.tenantId ? Number(filters.tenantId) : null;
  const customerId = filters.customerId ? Number(filters.customerId) : null;
  const userId = filters.userId ? Number(filters.userId) : null;

  const { data, isLoading, isError, refetch } = useOrders({
    page,
    size: pageSize,
    tenantId,
    customerId,
    userId,
    status: fixedStatus,
    q: filters.q.trim() || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });
  const deleteMutation = useDeleteOrder();
  const { data: catalogData, isLoading: isCatalogLoading } = useCatalogItems();
  const { data: customersData } = useCustomers({ page: 0, size: 100 });

  const orders = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const catalogItems = Array.isArray(catalogData) ? catalogData : [];
  const fallbackCatalogItems = useMemo(
    () =>
      (catalogMock.data ?? []).map((item) => ({
        id: item.id,
        tenantId: item.tenantId,
        name: item.name,
        description: item.description,
        priceCents: item.priceCents,
      })),
    [],
  );
  const composerCatalogItems =
    catalogItems.length > 0 ? catalogItems : fallbackCatalogItems;
  const composerCustomers = useMemo(
    () =>
      (customersData?.content ?? []).map((customer) => ({
        id: customer.id,
        name: customer.fullName?.trim() || `Customer #${customer.id}`,
      })),
    [customersData],
  );
  const fallbackCustomers = useMemo(
    () =>
      (contactsMock.data ?? []).slice(0, 50).map((contact, index) => ({
        id: index + 1,
        name: contact.name,
      })),
    [],
  );
  const composerCustomersWithFallback =
    composerCustomers.length > 0 ? composerCustomers : fallbackCustomers;

  // Map customers by id for display in the table
  const customersMap = new Map<number, { name: string; phone?: string }>();
  (customersData?.content ?? []).forEach((c) => {
    customersMap.set(c.id, { name: c.fullName ?? `Customer #${c.id}`, phone: c.phone ?? "" });
  });

  // Tenant filter/autocomplete component used in the filters accordion
  function TenantFilter({
    value,
    onChange,
  }: {
    value: number | null | undefined;
    onChange: (id: number | null) => void;
  }) {
    const tenants = useTenantsSelector().data?.content ?? [];
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const selected = value ? tenants.find((t) => t.id === value) : null;
    const filtered = search
      ? tenants.filter((t) => (t.name ?? "").toLowerCase().includes(search.toLowerCase()))
      : tenants;

    return (
      <div className="relative">
        <input
          type="text"
          value={open ? search : selected?.name ?? (value ? `ID ${value}` : "")}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar tenant..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        />
        {open && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-card shadow-lg">
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent transition-colors"
              onMouseDown={() => {
                onChange(null);
                setSearch("");
                setOpen(false);
              }}
            >
              Todos os tenants
            </button>
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                onMouseDown={() => {
                  onChange(t.id);
                  setSearch("");
                  setOpen(false);
                }}
              >
                {t.name ?? `Tenant #${t.id}`}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Customer filter/autocomplete used in the filters accordion
  function CustomerFilter({
    tenantId,
    value,
    onChange,
  }: {
    tenantId: number | null;
    value: number | null | undefined;
    onChange: (id: number | null) => void;
  }) {
    const { data } = useCustomers({ page: 0, size: 100, tenantId: tenantId ?? undefined });
    const customers = data?.content ?? [];
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const selected = value ? customers.find((c) => c.id === value) : null;
    const filtered = search
      ? customers.filter((c) => (c.fullName ?? "").toLowerCase().includes(search.toLowerCase()))
      : customers;

    return (
      <div className="relative">
        <input
          type="text"
          value={open ? search : selected?.fullName ?? (value ? `ID ${value}` : "")}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar cliente..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        />
        {open && filtered.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-card shadow-md text-sm">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="cursor-pointer px-3 py-2 hover:bg-accent transition-colors"
                onMouseDown={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
              >
                {c.fullName ?? `Cliente #${c.id}`} <span className="text-xs text-muted-foreground">#{c.id}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  function handleApplyFilters(e: React.FormEvent) {
    e.preventDefault();
    setFilters(draftFilters);
    setPage(0);
  }

  function handleClearFilter() {
    const cleared = {
      q: "",
      tenantId: "",
      customerId: "",
      userId: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    };
    setDraftFilters(cleared);
    setFilters(cleared);
    setPage(0);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Pedido excluído com sucesso.");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.error("Pedido não encontrado.");
      } else {
        toast.error("Erro ao excluir. Tente novamente.");
      }
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleFinalizeBudget(payload: QuoteFinalizePayload) {
    toast.success(
      `Orçamento finalizado para ${payload.customerName} (#${payload.customerId}) com total ${formatCurrencyCode(payload.totalCents, "BRL")}.`,
    );
    setShowComposer(false);
  }

  function openQuote(orderId?: number, customerId?: number) {
    if (isQuotesView) {
      setComposerTitle(orderId ? `Orçamento #${orderId}` : "Novo Orçamento");
    } else {
      setComposerTitle(orderId ? `Venda #${orderId}` : "Nova Venda");
    }
    setComposerCustomerId(customerId ?? null);
    setShowComposer(true);
  }

  function openInvoice(orderId: number) {
    setInvoiceOrderId(orderId);
  }

  const pageTitle = isQuotesView ? "Orçamentos" : "Vendas";
  const singularLabel = isQuotesView ? "orçamento" : "venda";
  const pluralLabel = isQuotesView ? "orçamentos" : "vendas";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Carregando..."
              : `${totalElements} ${totalElements !== 1 ? pluralLabel : singularLabel}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            openQuote();
          }}
          className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          {isQuotesView ? "Novo Orçamento" : "Nova Venda"}
        </button>
      </div>

      {/* Filters */}
      <FilterBar onClear={handleClearFilter} activeCount={0}>
        <div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Buscar por ID/código</label>
            <input
              type="text"
              value={draftFilters.q}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Buscar por ID/código"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 w-full"
            />
          </div>
        </div>
        <div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Status</label>
            <select
              value={draftFilters.status}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, status: e.target.value }))}
              disabled
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 w-full"
            >
              <option value={fixedStatus}>{fixedStatus}</option>
            </select>
          </div>
        </div>
        <div>
          {/* Tenant autocomplete */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Tenant</label>
            <TenantFilter
              value={draftFilters.tenantId ? Number(draftFilters.tenantId) : null}
              onChange={(id) => setDraftFilters((prev) => ({ ...prev, tenantId: id ? String(id) : "" }))}
            />
          </div>
        </div>
        <div>
          {/* Customer autocomplete */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Cliente</label>
            <CustomerFilter
              tenantId={draftFilters.tenantId ? Number(draftFilters.tenantId) : null}
              value={draftFilters.customerId ? Number(draftFilters.customerId) : null}
              onChange={(id) => setDraftFilters((prev) => ({ ...prev, customerId: id ? String(id) : "" }))}
            />
          </div>
        </div>
        <div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Responsável</label>
            <input
              type="number"
              min="1"
              value={draftFilters.userId}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, userId: e.target.value }))}
              placeholder="Responsável ID"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 w-full"
            />
          </div>
        </div>
        <div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Data início</label>
            <input
              type="date"
              value={draftFilters.dateFrom}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 w-full"
            />
          </div>
        </div>
        <div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Data fim</label>
            <input
              type="date"
              value={draftFilters.dateTo}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 w-full"
            />
          </div>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Search size={16} />
              Buscar
            </button>
            <button
              type="button"
              onClick={handleClearFilter}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      </FilterBar>

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>Erro ao carregar pedidos. Verifique sua conexão.</span>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-1.5 underline underline-offset-2 hover:no-underline"
          >
            <RefreshCw size={12} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground bg-muted/40">
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={5} />
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <p>Nenhum {singularLabel} encontrado.</p>
                    <button
                      type="button"
                      onClick={() => openQuote()}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      Criar primeiro {singularLabel}
                    </button>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className={
                      isQuotesView
                        ? "hover:bg-accent/30 transition-colors cursor-pointer"
                        : "hover:bg-accent/30 transition-colors"
                    }
                    onClick={() =>
                      isQuotesView
                        ? openQuote(order.id, order.customerId)
                        : undefined
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">
                        {order.code ?? `#${order.id}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatShortDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">
                        {customersMap.get(order.customerId)?.name ?? String(order.customerId)}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap size={12} className="text-muted-foreground" />
                        <span>{customersMap.get(order.customerId)?.phone ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">
                        {formatCurrencyCode(order.totalCents, order.currencyCode)}
                      </div>
                      <div className="text-xs text-muted-foreground">{order.items.length} itens</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} colorMap={ORDER_STATUS_COLORS} />
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="Ver detalhes"
                          onClick={() =>
                            isQuotesView
                              ? openQuote(order.id, order.customerId)
                              : openInvoice(order.id)
                          }
                          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Eye size={17} />
                        </button>
                        {isQuotesView && (
                          <>
                            <button
                              type="button"
                              aria-label="Editar"
                              onClick={() =>
                                openQuote(order.id, order.customerId)
                              }
                              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                              <Pencil size={17} />
                            </button>
                            <button
                              type="button"
                              aria-label="Excluir"
                              onClick={() =>
                                setDeleteTarget({
                                  id: order.id,
                                  label: `#${order.id}`,
                                })
                              }
                              className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 size={17} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setDefaultPageSize(size);
            setPageSize(size);
            setPage(0);
          }}
          onFirst={() => setPage(0)}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
          onLast={() => setPage(Math.max(totalPages - 1, 0))}
        />
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          description={
            <>
              Deseja excluir o pedido{" "}
              <span className="font-medium">{deleteTarget.label}</span>? Esta
              ação não pode ser desfeita.
            </>
          }
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}

      <QuoteComposerOverlay
        open={showComposer}
        onClose={() => setShowComposer(false)}
        title={composerTitle}
        catalogItems={composerCatalogItems}
        isCatalogLoading={isCatalogLoading}
        customers={composerCustomersWithFallback}
        initialCustomerId={composerCustomerId}
        onFinalize={handleFinalizeBudget}
      />

      {invoiceOrderId !== null && !isQuotesView && (
        <div className="fixed inset-0 z-[70] flex h-screen w-screen flex-col bg-slate-200">
          <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3">
            <h3 className="text-lg font-semibold">
              Invoice PDF{invoiceOrderId > 0 ? ` #${invoiceOrderId}` : ""}
            </h3>
            <button
              type="button"
              onClick={() => setInvoiceOrderId(null)}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              <X size={16} />
              Fechar
            </button>
          </div>
          <div className="flex-1 p-3">
            <iframe
              title="Invoice PDF Viewer"
              src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")}`}
              className="h-full w-full rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
