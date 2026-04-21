import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { FilterBar } from "@/features/expenses/components/FilterBar";
import { ItemCategoryListTable } from "@/features/catalog/categories/components/ItemCategoryListTable";
import {
  useItemCategories,
  useSortItemCategories,
} from "@/features/catalog/categories/api/useItemCategories";

// show all categories without pagination
const ALL_PAGE_SIZE = 10000;

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

  const { data, isLoading, isError } = useItemCategories({
    page,
    size: pageSize,
    name: filters.name.trim() || undefined,
    showOnSite:
      filters.showOnSite === "all"
        ? undefined
        : filters.showOnSite === "true",
  });
  const sortMutation = useSortItemCategories();

  const [rows, setRows] = useState(() => data?.content ?? []);
  const [reorderingAction, setReorderingAction] = useState<{
    id: number;
    direction: "up" | "down";
  } | null>(null);

  const categories = data?.content ?? [];
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
      {effectiveRows.length === 0 && !isLoading && !isError ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <div className="flex flex-col items-center gap-3">
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
        </div>
      ) : (
        <ItemCategoryListTable
          categories={effectiveRows}
          isLoading={isLoading}
          isError={isError}
          onEdit={(cat) => void navigate(`/catalog/categories/${cat.id}/edit`)}
          onMoveUp={(id) => moveCategory(id, "up")}
          onMoveDown={(id) => moveCategory(id, "down")}
          reorderingAction={reorderingAction}
          emptyIcon="tag"
          emptyMessage="Nenhuma categoria encontrada."
        />
      )}
    </div>
  );
}
