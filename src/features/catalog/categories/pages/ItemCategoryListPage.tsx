import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Pencil, Trash2, Tag, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FilterBar } from "@/features/expenses/components/FilterBar";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import {
  useItemCategories,
  useDeleteItemCategory,
  useSortItemCategories,
} from "@/features/catalog/categories/api/useItemCategories";

// show all categories without pagination
const ALL_PAGE_SIZE = 10000;

// ─── Type Badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const isProduct = type === "PRODUCT";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        isProduct
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      )}
    >
      {isProduct ? "Produto" : "Servico"}
    </span>
  );
}

function SiteBadge({ showOnSite }: { showOnSite?: boolean | null }) {
  if (showOnSite == null) {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        —
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        showOnSite
          ? "bg-emerald-100 text-emerald-700"
          : "bg-muted text-muted-foreground",
      )}
    >
      {showOnSite ? "Sim" : "Nao"}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ItemCategoryListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageSize = ALL_PAGE_SIZE;
  const [draftFilters, setDraftFilters] = useState({
    name: "",
    showOnSite: "all" as "all" | "true" | "false",
  });
  const [filters, setFilters] = useState({
    name: "",
    showOnSite: "all" as "all" | "true" | "false",
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const { data, isLoading, isError } = useItemCategories({
    page,
    size: pageSize,
    name: filters.name.trim() || undefined,
    showOnSite:
      filters.showOnSite === "all"
        ? undefined
        : filters.showOnSite === "true",
  });
  const deleteMutation = useDeleteItemCategory();
  const sortMutation = useSortItemCategories();

  const [rows, setRows] = useState(() => data?.content ?? []);
  const [reorderingAction, setReorderingAction] = useState<{
    id: number;
    direction: "up" | "down";
  } | null>(null);

  const categories = data?.content ?? [];
  // use rows for optimistic reordering UI; fallback to categories from API
  const effectiveRows = rows.length > 0 ? rows : categories;
  const totalElements = data?.totalElements ?? 0;

  const activeFilterCount = [
    filters.name.trim() !== "",
    filters.showOnSite !== "all",
  ].filter(Boolean).length;

  function handleApplyFilters() {
    setFilters(draftFilters);
    setPage(0);
  }

  function handleClearFilter() {
    const cleared = {
      name: "",
      showOnSite: "all" as const,
    };
    setDraftFilters(cleared);
    setFilters(cleared);
    setPage(0);
  }

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

  // Keep local rows in sync when API data changes
  useEffect(() => {
    setRows(data?.content ?? []);
  }, [data?.content]);

  async function moveCategory(id: number, direction: "up" | "down") {
    if (reorderingAction) return;

    const current = [...(rows.length > 0 ? rows : categories)];
    const idx = current.findIndex((c) => c.id === id);
    if (idx < 0) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const reordered = [...current];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
    setRows(reordered);
    setReorderingAction({ id, direction });

    try {
      const items = reordered.map((category, i) => ({ id: category.id, sortOrder: i }));
      await sortMutation.mutateAsync({ items });
      toast.success("Ordem das categorias atualizada.");
    } catch (err) {
      setRows(current);
      toast.error("Não foi possível atualizar a ordem das categorias.");
    } finally {
      setReorderingAction(null);
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
              Esta acao nao pode ser desfeita.
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

      {/* Filters */}
      <FilterBar onClear={handleClearFilter} activeCount={activeFilterCount}>
        <div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Buscar por nome</label>
            <input
              type="text"
              value={draftFilters.name}
              onChange={(e) =>
                setDraftFilters((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Buscar categoria..."
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 w-full"
            />
          </div>
        </div>
        <div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Exibir no site</label>
            <select
              value={draftFilters.showOnSite}
              onChange={(e) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  showOnSite: e.target.value as "all" | "true" | "false",
                }))
              }
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 w-full"
            >
              <option value="all">Todos</option>
              <option value="true">Sim</option>
              <option value="false">Nao</option>
            </select>
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Thumb
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nome
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                Descricao
              </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                Tipos
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                Exibir no site
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
                   <td colSpan={5} className="px-4 py-3">
                     <div className="h-4 w-full animate-pulse rounded bg-muted" />
                   </td>
                 </tr>
               ))
            ) : isError ? (
               <tr>
                 <td
                   colSpan={5}
                   className="px-4 py-8 text-center text-sm text-destructive"
                 >
                   Erro ao carregar categorias.
                 </td>
               </tr>
            ) : categories.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-4 py-12 text-center">
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
              categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => void navigate(`/catalog/categories/${cat.id}/edit`)}
                >
                  <td className="px-4 py-3">
                    {cat.photo ? (
                      <img
                        src={cat.photo}
                        alt={cat.name}
                        className="h-10 w-10 rounded-md border border-border object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted">
                        <Tag size={14} className="text-muted-foreground" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{cat.name}</div>
                    <div className="mt-1 md:hidden text-xs text-muted-foreground">
                      <SiteBadge showOnSite={cat.showOnSite} />
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {cat.description?.trim() || (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex items-center gap-1.5">
                      {(cat.availableTypes ?? []).map((t) => (
                        <TypeBadge key={t} type={t} />
                      ))}
                      {(!cat.availableTypes || cat.availableTypes.length === 0) && (
                        <span className="text-muted-foreground/50 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <SiteBadge showOnSite={cat.showOnSite} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => void moveCategory(cat.id, "up")}
                          disabled={reorderingAction !== null || effectiveRows[0]?.id === cat.id}
                          className="rounded-md p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
                          title="Mover para cima"
                        >
                          {reorderingAction?.id === cat.id && reorderingAction.direction === "up" ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <ChevronUp size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => void moveCategory(cat.id, "down")}
                          disabled={
                            reorderingAction !== null ||
                            effectiveRows[effectiveRows.length - 1]?.id === cat.id
                          }
                          className="rounded-md p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
                          title="Mover para baixo"
                        >
                          {reorderingAction?.id === cat.id && reorderingAction.direction === "down" ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void navigate(`/catalog/categories/${cat.id}/edit`);
                          }}
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination removed: show all categories */}
      </div>
    </div>
  );
}
