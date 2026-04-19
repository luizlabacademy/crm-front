import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useLeads, useDeleteLead } from "@/features/leads/api/useLeads";
import { LEAD_STATUS_COLORS } from "@/features/leads/types/leadTypes";
import { formatDateTime } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { SkeletonRow } from "@/components/shared/SkeletonRow";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import { EmptyState } from "@/components/shared/EmptyState";

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LeadListPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [tenantIdInput, setTenantIdInput] = useState("");
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    label: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useLeads({
    page,
    size: 20,
    tenantId,
  });
  const deleteMutation = useDeleteLead();

  const leads = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  function handleTenantFilter(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(tenantIdInput, 10);
    setTenantId(isNaN(val) ? null : val);
    setPage(0);
  }

  function handleClearFilter() {
    setTenantIdInput("");
    setTenantId(null);
    setPage(0);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Lead excluído com sucesso.");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.error("Lead não encontrado.");
      } else {
        toast.error("Erro ao excluir. Tente novamente.");
      }
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Carregando..."
              : `${totalElements} lead${totalElements !== 1 ? "s" : ""} cadastrado${totalElements !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void navigate("/leads/new")}
          className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Novo lead
        </button>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleTenantFilter}
        className="flex items-center gap-2 flex-wrap"
      >
        <input
          type="number"
          value={tenantIdInput}
          onChange={(e) => setTenantIdInput(e.target.value)}
          placeholder="Filtrar por Tenant ID"
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 w-48"
        />
        <button
          type="submit"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          Filtrar
        </button>
        {tenantId !== null && (
          <button
            type="button"
            onClick={handleClearFilter}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar filtro
          </button>
        )}
      </form>

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>Erro ao carregar leads. Verifique sua conexão.</span>
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
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Fonte</th>
                <th className="px-4 py-3 font-medium">Valor estimado</th>
                <th className="px-4 py-3 font-medium">Cliente ID</th>
                <th className="px-4 py-3 font-medium">Criado em</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={7} />
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="Nenhum lead encontrado."
                      action={
                        <button
                          type="button"
                          onClick={() => void navigate("/leads/new")}
                          className="text-sm text-primary hover:underline"
                        >
                          Criar primeiro lead
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => void navigate(`/leads/${lead.id}`)}
                  >
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {lead.id}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={lead.status}
                        colorMap={LEAD_STATUS_COLORS}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.source ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {lead.estimatedValueCents != null
                        ? formatCurrency(lead.estimatedValueCents)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {lead.customerId != null ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void navigate(`/customers/${lead.customerId}`);
                          }}
                          className="text-primary hover:underline"
                        >
                          {lead.customerId}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDateTime(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="Mensagens"
                          onClick={() => void navigate(`/leads/${lead.id}`)}
                          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <MessageSquare size={17} />
                        </button>
                        <button
                          type="button"
                          aria-label="Ver detalhes"
                          onClick={() => void navigate(`/leads/${lead.id}`)}
                          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          aria-label="Editar"
                          onClick={() =>
                            void navigate(`/leads/${lead.id}/edit`)
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
                              id: lead.id,
                              label: `#${lead.id} — ${lead.status}`,
                            })
                          }
                          className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={17} />
                        </button>
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
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          description={
            <>
              Deseja excluir o lead{" "}
              <span className="font-medium">{deleteTarget.label}</span>? Esta
              ação não pode ser desfeita.
            </>
          }
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
