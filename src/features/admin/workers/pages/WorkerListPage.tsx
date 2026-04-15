import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  Wrench,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  useWorkers,
  useDeleteWorker,
  useTenantsList,
} from "@/features/admin/workers/api/useWorkers";
import { getEntityDisplayName } from "@/lib/types/personTypes";
import type { TenantSummary } from "@/features/admin/workers/types/workerTypes";
import { cn } from "@/lib/utils";

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
        </td>
      ))}
    </tr>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600",
      )}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

function TenantAutocomplete({
  tenants,
  value,
  onChange,
}: {
  tenants: TenantSummary[];
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

function DeleteModal({
  name,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-destructive mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Confirmar exclusão</p>
            <p className="text-sm text-muted-foreground">
              Deseja excluir o worker{" "}
              <span className="font-medium">{name}</span>? Esta ação não pode
              ser desfeita.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-destructive/90 text-white px-3 py-1.5 text-sm hover:bg-destructive transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {isDeleting && <RefreshCw size={12} className="animate-spin" />}
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <span>
        Página {page + 1} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page === 0}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent transition-colors disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages - 1}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent transition-colors disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export function WorkerListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useWorkers({
    page,
    size: 20,
    tenantId,
  });
  const deleteMutation = useDeleteWorker();
  const { data: tenantsData } = useTenantsList();

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
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
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
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </div>

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
