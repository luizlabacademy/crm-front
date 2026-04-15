import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  User,
  ShoppingCart,
  MessageSquare,
  CalendarDays,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  useCustomer,
  useDeleteCustomer,
} from "@/features/customers/api/useCustomers";
import {
  getEntityDisplayName,
  getEntityDocument,
  type PageResponse,
} from "@/lib/types/personTypes";
import { api } from "@/lib/api/client";
import { formatDateTime, formatShortDate } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { ActiveBadge } from "@/components/shared/ActiveBadge";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lead {
  id: number;
  customerId?: number;
  status: string;
  createdAt: string;
}

interface Order {
  id: number;
  code?: string;
  customerId?: number;
  status: string;
  totalCents: number;
  createdAt: string;
}

interface Schedule {
  id: number;
  customerId?: number;
  appointmentId?: number;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDocument(doc: string): string {
  const digits = doc.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }
  return doc;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4">
      <span className="text-xs text-muted-foreground w-32 shrink-0">
        {label}
      </span>
      <span className="text-sm">{value ?? "—"}</span>
    </div>
  );
}

// ─── Related data hooks ───────────────────────────────────────────────────────

function useCustomerLeads(customerId: number, tenantId: number) {
  return useQuery<Lead[]>({
    queryKey: ["customer-leads", customerId, tenantId],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<Lead>>("/api/v1/leads", {
        params: { tenantId, page: 0, size: 50 },
      });
      return (data.content ?? []).filter((l) => l.customerId === customerId);
    },
    enabled: Boolean(tenantId),
  });
}

function useCustomerOrders(customerId: number, tenantId: number) {
  return useQuery<Order[]>({
    queryKey: ["customer-orders", customerId, tenantId],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<Order>>("/api/v1/orders", {
        params: { tenantId, page: 0, size: 50 },
      });
      return (data.content ?? []).filter((o) => o.customerId === customerId);
    },
    enabled: Boolean(tenantId),
  });
}

function useCustomerSchedules(customerId: number, tenantId: number) {
  return useQuery<Schedule[]>({
    queryKey: ["customer-schedules", customerId, tenantId],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<Schedule>>(
        "/api/v1/schedules",
        { params: { tenantId, page: 0, size: 50 } },
      );
      return (data.content ?? []).filter((s) => s.customerId === customerId);
    },
    enabled: Boolean(tenantId),
  });
}

// ─── Section components ───────────────────────────────────────────────────────

function LeadsSection({
  customerId,
  tenantId,
}: {
  customerId: number;
  tenantId: number;
}) {
  const navigate = useNavigate();
  const { data: leads = [], isLoading } = useCustomerLeads(
    customerId,
    tenantId,
  );
  const recent = leads.slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold">Leads</span>
          {!isLoading && (
            <span className="text-xs text-muted-foreground">
              ({leads.length})
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void navigate(`/leads/new?customerId=${customerId}`)}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
        >
          <Plus size={11} />
          Novo lead
        </button>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground text-center">
          Nenhum lead encontrado.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {recent.map((lead) => (
            <Link
              key={lead.id}
              to={`/leads/${lead.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors"
            >
              <span className="text-sm">Lead #{lead.id}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {lead.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatShortDate(lead.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersSection({
  customerId,
  tenantId,
}: {
  customerId: number;
  tenantId: number;
}) {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useCustomerOrders(
    customerId,
    tenantId,
  );
  const recent = orders.slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingCart size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold">Pedidos</span>
          {!isLoading && (
            <span className="text-xs text-muted-foreground">
              ({orders.length})
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void navigate(`/orders/new?customerId=${customerId}`)}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
        >
          <Plus size={11} />
          Novo pedido
        </button>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground text-center">
          Nenhum pedido encontrado.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {recent.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors"
            >
              <span className="text-sm font-mono text-xs">
                {order.code ?? `#${order.id}`}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-nums">
                  {formatCurrency(order.totalCents)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {order.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatShortDate(order.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SchedulesSection({
  customerId,
  tenantId,
}: {
  customerId: number;
  tenantId: number;
}) {
  const navigate = useNavigate();
  const { data: schedules = [], isLoading } = useCustomerSchedules(
    customerId,
    tenantId,
  );
  const recent = schedules.slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarDays size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold">Agendamentos</span>
          {!isLoading && (
            <span className="text-xs text-muted-foreground">
              ({schedules.length})
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() =>
            void navigate(`/schedules/new?customerId=${customerId}`)
          }
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
        >
          <Plus size={11} />
          Novo agendamento
        </button>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground text-center">
          Nenhum agendamento encontrado.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {recent.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm">Schedule #{schedule.id}</span>
              <span className="text-xs text-muted-foreground">
                {formatShortDate(schedule.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CustomerDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const customerId = id ? parseInt(id, 10) : null;

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: customer, isLoading, isError } = useCustomer(customerId);

  const deleteMutation = useDeleteCustomer();

  async function handleDelete() {
    if (!customerId) return;
    try {
      await deleteMutation.mutateAsync(customerId);
      toast.success("Cliente excluído com sucesso.");
      void navigate("/customers");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.error("Cliente não encontrado.");
      } else {
        toast.error("Erro ao excluir. Tente novamente.");
      }
    } finally {
      setShowDeleteModal(false);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-5 max-w-3xl">
        <div className="h-7 w-56 animate-pulse rounded bg-muted" />
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // 404
  if (isError || !customer) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Cliente não encontrado.</p>
        <button
          type="button"
          onClick={() => void navigate("/customers")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Voltar para listagem
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void navigate("/customers")}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">
                {getEntityDisplayName(customer)}
              </h1>
              <ActiveBadge active={customer.active} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Cliente #{customer.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void navigate(`/customers/${customer.id}/edit`)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <Pencil size={13} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-3 py-2 text-sm hover:bg-destructive/20 transition-colors"
          >
            <Trash2 size={13} />
            Excluir
          </button>
        </div>
      </div>

      {/* Data card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-xs">
            Dados do cliente
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="ID" value={customer.id} />
          {customer.code && <DetailRow label="Código" value={customer.code} />}
          <DetailRow label="Tenant ID" value={customer.tenantId} />
          <DetailRow label="E-mail" value={customer.email} />
          <DetailRow label="Telefone" value={customer.phone} />
          <DetailRow
            label="Documento"
            value={
              customer.document
                ? formatDocument(customer.document)
                : getEntityDocument(customer) !== "—"
                  ? getEntityDocument(customer)
                  : null
            }
          />
          <DetailRow
            label="Cadastrado em"
            value={formatDateTime(customer.createdAt)}
          />
          {customer.updatedAt && (
            <DetailRow
              label="Atualizado em"
              value={formatDateTime(customer.updatedAt)}
            />
          )}
        </div>

        {/* Pessoa Física */}
        {customer.physical &&
          (customer.physical.fullName ||
            customer.physical.cpf ||
            customer.physical.birthDate) && (
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Pessoa Física
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {customer.physical.fullName && (
                  <DetailRow label="Nome" value={customer.physical.fullName} />
                )}
                {customer.physical.cpf && (
                  <DetailRow label="CPF" value={customer.physical.cpf} />
                )}
                {customer.physical.birthDate && (
                  <DetailRow
                    label="Nascimento"
                    value={customer.physical.birthDate}
                  />
                )}
              </div>
            </div>
          )}

        {/* Pessoa Jurídica */}
        {customer.legal &&
          (customer.legal.corporateName ||
            customer.legal.tradeName ||
            customer.legal.cnpj) && (
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Pessoa Jurídica
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {customer.legal.corporateName && (
                  <DetailRow
                    label="Razão social"
                    value={customer.legal.corporateName}
                  />
                )}
                {customer.legal.tradeName && (
                  <DetailRow
                    label="Nome fantasia"
                    value={customer.legal.tradeName}
                  />
                )}
                {customer.legal.cnpj && (
                  <DetailRow label="CNPJ" value={customer.legal.cnpj} />
                )}
              </div>
            </div>
          )}

        {/* Contatos */}
        {customer.contacts && customer.contacts.length > 0 && (
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center gap-1.5">
              <Phone size={13} className="text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Contatos
              </p>
            </div>
            <div className="space-y-1">
              {customer.contacts.map((c, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                    {c.type}
                  </span>
                  <span>{c.contactValue}</span>
                  {c.primary && (
                    <span className="text-xs text-primary">(principal)</span>
                  )}
                  {!c.active && (
                    <span className="text-xs text-muted-foreground">
                      (inativo)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Endereços */}
        {customer.addresses && customer.addresses.length > 0 && (
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Endereços
              </p>
            </div>
            <div className="space-y-2">
              {customer.addresses.map((a, i) => (
                <div key={i} className="text-sm space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                      {a.type === "RESIDENTIAL" ? "Residencial" : "Comercial"}
                    </span>
                    {a.primary && (
                      <span className="text-xs text-primary">(principal)</span>
                    )}
                    {!a.active && (
                      <span className="text-xs text-muted-foreground">
                        (inativo)
                      </span>
                    )}
                  </div>
                  {(a.street || a.number) && (
                    <p className="text-muted-foreground">
                      {[a.street, a.number, a.complement]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {(a.neighborhood || a.postalCode) && (
                    <p className="text-muted-foreground text-xs">
                      {[a.neighborhood, a.postalCode]
                        .filter(Boolean)
                        .join(" — ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {customer.notes && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Observações</p>
            <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Related data */}
      <LeadsSection customerId={customer.id} tenantId={customer.tenantId} />
      <OrdersSection customerId={customer.id} tenantId={customer.tenantId} />
      <SchedulesSection customerId={customer.id} tenantId={customer.tenantId} />

      {/* Delete modal */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          description={
            <>
              Deseja excluir o cliente{" "}
              <span className="font-medium">
                {getEntityDisplayName(customer)}
              </span>
              ? Esta ação não pode ser desfeita.
            </>
          }
          onConfirm={() => void handleDelete()}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
