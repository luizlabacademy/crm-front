import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Pencil, Trash2, RefreshCw, Wrench, Search } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  useWorkers,
  useDeleteWorker,
} from "@/features/admin/workers/api/useWorkers";
import { useTenantsSelector } from "@/lib/api/useTenants";
import { getEntityDisplayName } from "@/lib/types/personTypes";
import type { TenantResponse } from "@/features/admin/tenants/types/tenantTypes";
import { SkeletonRow } from "@/components/shared/SkeletonRow";
import { ActiveBadge } from "@/components/shared/ActiveBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

function TenantAutocomplete({
  tenants,
  value,
  onChange,
}: {
  tenants: TenantResponse[];
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const selected = tenants.find((t) => t.id === value);
  const filtered = tenants.filter((t) =>
    (t.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative min-w-64">
      <div className="relative">
        <input
          type="text"
          value={open ? search : (selected?.name ?? "")}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Filtrar por tenant"
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        />
        <Search
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
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

export function WorkerListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useWorkers({
    page,
    size: pageSize,
    tenantId,
  });
  const deleteMutation = useDeleteWorker();
  const { data: tenantsData } = useTenantsSelector();

  const workers = data?.content ?? [];
  const tenants = tenantsData?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Worker excluído com sucesso.");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.error("Worker não encontrado.");
      } else {
        toast.error("Erro ao excluir. Tente novamente.");
      }
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Workers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Carregando..."
              : `${totalElements} worker${totalElements !== 1 ? "s" : ""} cadastrado${totalElements !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void navigate("/workers/new")}
          className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Novo worker
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <TenantAutocomplete
          tenants={tenants}
          value={tenantId}
          onChange={(id) => {
            setTenantId(id);
            setPage(0);
          }}
        />
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>Erro ao carregar workers. Verifique sua conexão.</span>
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

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground bg-muted/40">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Tenant</th>
                <th className="px-4 py-3 font-medium">Usuário vinculado</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={5} />
                ))
              ) : workers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Wrench size={32} className="text-muted-foreground/50" />
                      <p>Nenhum worker encontrado.</p>
                      <button
                        type="button"
                        onClick={() => void navigate("/workers/new")}
                        className="mt-1 text-sm text-primary hover:underline"
                      >
                        Criar worker
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                workers.map((worker) => {
                  const displayName =
                    getEntityDisplayName(worker) !== "—"
                      ? getEntityDisplayName(worker)
                      : `Worker #${worker.id}`;
                  const tenantName =
                    tenants.find((t) => t.id === worker.tenantId)?.name ??
                    `Tenant #${worker.tenantId}`;

                  return (
                    <tr
                      key={worker.id}
                      className="hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() =>
                        void navigate(`/workers/${worker.id}/edit`)
                      }
                    >
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                        {displayName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tenantName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {worker.userId != null ? `#${worker.userId}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <ActiveBadge active={worker.active} />
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            aria-label="Editar worker"
                            onClick={() =>
                              void navigate(`/workers/${worker.id}/edit`)
                            }
                            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            aria-label="Excluir worker"
                            onClick={() =>
                              setDeleteTarget({
                                id: worker.id,
                                name: displayName,
                              })
                            }
                            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              Deseja excluir o worker{" "}
              <span className="font-medium">{deleteTarget.name}</span>? Esta
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
