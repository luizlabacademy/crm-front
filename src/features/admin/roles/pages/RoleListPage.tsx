import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Pencil, Trash2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRoles, useDeleteRole } from "@/features/admin/roles/api/useRoles";
import { SkeletonRow } from "@/components/shared/SkeletonRow";
import { ActiveBadge } from "@/components/shared/ActiveBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RoleListPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useRoles({
    page,
    size: pageSize,
  });
  const deleteMutation = useDeleteRole();

  const roles = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Perfil excluído com sucesso.");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.error("Perfil não encontrado.");
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
          <h1 className="text-2xl font-semibold">Perfis de Acesso</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Carregando..."
              : `${totalElements} perfil${totalElements !== 1 ? "is" : ""} cadastrado${totalElements !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void navigate("/admin/permissions")}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            Permissões
          </button>
          <button
            type="button"
            onClick={() => void navigate("/admin/roles/new")}
            className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Novo perfil
          </button>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>Erro ao carregar perfis. Verifique sua conexão.</span>
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
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={5} />
                ))
              ) : roles.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ShieldCheck
                        size={32}
                        className="text-muted-foreground/50"
                      />
                      <p>Nenhum perfil encontrado.</p>
                      <button
                        type="button"
                        onClick={() => void navigate("/admin/roles/new")}
                        className="mt-1 text-sm text-primary hover:underline"
                      >
                        Criar perfil
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr
                    key={role.id}
                    className="hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() =>
                      void navigate(`/admin/roles/${role.id}/edit`)
                    }
                  >
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {role.id}
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                      {role.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[300px] truncate">
                      {role.description ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={role.active} />
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="Editar perfil"
                          onClick={() =>
                            void navigate(`/admin/roles/${role.id}/edit`)
                          }
                          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          aria-label="Excluir perfil"
                          onClick={() =>
                            setDeleteTarget({ id: role.id, name: role.name })
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

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          description={
            <>
              Deseja excluir o perfil{" "}
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
