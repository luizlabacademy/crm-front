import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Pencil, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { usePersons, useDeletePerson } from "@/features/persons/api/usePersons";
import {
  getPersonDisplayName,
  getPersonDocument,
  getPersonType,
} from "@/features/persons/types/personTypes";
import { formatDateTime } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils";

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
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

function TypeBadge({ type }: { type: "physical" | "legal" }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
      {type === "physical" ? "Física" : "Jurídica"}
    </span>
  );
}

interface DeleteModalProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteModal({
  name,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-destructive mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Confirmar exclusão</p>
            <p className="text-sm text-muted-foreground">
              Deseja excluir <span className="font-medium">{name}</span>? Esta
              ação não pode ser desfeita.
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

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

function Pagination({ page, totalPages, onPrev, onNext }: PaginationProps) {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PersonListPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [tenantIdInput, setTenantIdInput] = useState("");
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = usePersons({
    page,
    size: 20,
    tenantId,
  });

  const deleteMutation = useDeletePerson();

  const persons = data?.content ?? [];
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
      toast.success("Pessoa excluída com sucesso.");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.error("Pessoa não encontrada.");
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
          <h1 className="text-2xl font-semibold">Pessoas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Carregando..."
              : `${totalElements} pessoa${totalElements !== 1 ? "s" : ""} cadastrada${totalElements !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void navigate("/persons/new")}
          className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Nova pessoa
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
          <span>Erro ao carregar pessoas. Verifique sua conexão.</span>
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
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Documento</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Cadastrado em</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : persons.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <p>Nenhuma pessoa encontrada.</p>
                    <button
                      type="button"
                      onClick={() => void navigate("/persons/new")}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      Cadastrar primeira pessoa
                    </button>
                  </td>
                </tr>
              ) : (
                persons.map((person) => {
                  const name = getPersonDisplayName(person);
                  const doc = getPersonDocument(person);
                  const type = getPersonType(person);
                  return (
                    <tr
                      key={person.id}
                      className="hover:bg-accent/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {person.id}
                      </td>
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                        {name}
                      </td>
                      <td className="px-4 py-3">
                        <TypeBadge type={type} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {doc !== "—" ? formatDocument(doc) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <ActiveBadge active={person.active} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDateTime(person.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            aria-label="Editar"
                            onClick={() =>
                              void navigate(`/persons/${person.id}/edit`)
                            }
                            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label="Excluir"
                            onClick={() =>
                              setDeleteTarget({ id: person.id, name })
                            }
                            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={14} />
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

      {/* Delete confirmation modal */}
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
