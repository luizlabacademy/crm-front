import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { ActiveBadge } from "@/components/shared/ActiveBadge";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  useItemCategories,
  useDeleteItemCategory,
} from "@/features/catalog/categories/api/useItemCategories";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ItemCategoryListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const { data, isLoading, isError } = useItemCategories({
    page,
    size: pageSize,
  });
  const deleteMutation = useDeleteItemCategory();

  const categories = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const filtered = search.trim()
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      )
    : categories;

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Categoria excluida com sucesso.");
    } catch {
      toast.error("Erro ao excluir categoria.");
    } finally {
      setDeleteId(null);
      setDeleteName("");
    }
  }

  return (
    <div className="space-y-6">
      {deleteId !== null && (
        <ConfirmDeleteModal
          description={
            <>
              Tem certeza que deseja excluir{" "}
              <span className="font-medium text-foreground">{deleteName}</span>?
              Esta ação não pode ser desfeita.
            </>
          }
          onConfirm={() => void handleDelete()}
          onCancel={() => {
            setDeleteId(null);
            setDeleteName("");
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Categorias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalElements} categorias cadastradas
          </p>
        </div>
        <button
          type="button"
          onClick={() => void navigate("/catalog/categories/new")}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Nova Categoria
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoria..."
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Descricao
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-destructive"
                >
                  Erro ao carregar categorias.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Tag size={32} className="text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma categoria encontrada.
                    </p>
                    <button
                      type="button"
                      onClick={() => void navigate("/catalog/categories/new")}
                      className="text-xs text-primary hover:underline"
                    >
                      Criar primeira categoria
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">
                    {cat.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={cat.active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          void navigate(`/catalog/categories/${cat.id}/edit`)
                        }
                        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteId(cat.id);
                          setDeleteName(cat.name);
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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
    </div>
  );
}
