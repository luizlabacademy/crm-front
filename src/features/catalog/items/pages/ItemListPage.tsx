import { useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { Plus, Search, Pencil, Trash2, Package, Tag, Wrench } from "lucide-react";
import { toast } from "sonner";
import { ActiveBadge } from "@/components/shared/ActiveBadge";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import { TablePagination } from "@/components/shared/TablePagination";
import { FilterBar } from "@/features/expenses/components/FilterBar";
import { useItems, useDeleteItem } from "@/features/catalog/items/api/useItems";
import { useItemCategoriesCatalog } from "@/features/catalog/categories/api/useItemCategories";
import type { ItemType } from "@/features/catalog/items/types/itemTypes";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ItemListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Derive type from route path first, then fallback to query param
  const pathType: ItemType | null = location.pathname.includes("/catalog/products")
    ? "PRODUCT"
    : location.pathname.includes("/catalog/services")
      ? "SERVICE"
      : null;
  const requestedType = pathType ?? searchParams.get("type");
  const typeFilter: ItemType | null =
    requestedType === "SERVICE" || requestedType === "PRODUCT"
      ? requestedType
      : null;

  const basePath = typeFilter === "PRODUCT"
    ? "/catalog/products"
    : typeFilter === "SERVICE"
      ? "/catalog/services"
      : "/catalog/items";

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());
  const [draftFilters, setDraftFilters] = useState({
    q: "",
    categoryId: "",
  });
  const [filters, setFilters] = useState({
    q: "",
    categoryId: "",
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const { data, isLoading, isError } = useItems({
    page,
    size: pageSize,
    type: typeFilter ?? undefined,
    search: filters.q.trim() || undefined,
    categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
  });
  const { data: allCategories = [] } = useItemCategoriesCatalog();
  // Filter categories by type
  const categories = typeFilter
    ? allCategories.filter((c) => c.availableTypes?.includes(typeFilter))
    : allCategories;
  const deleteMutation = useDeleteItem();

  const items = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const activeFilterCount = [
    filters.q.trim() !== "",
    filters.categoryId !== "",
  ].filter(Boolean).length;

  const isService = typeFilter === "SERVICE";
  const isProduct = typeFilter === "PRODUCT";
  const itemLabel = isService ? "servicos" : isProduct ? "produtos" : "itens";
  const itemLabelSingular = isService ? "servico" : isProduct ? "produto" : "item";
  const pageTitle = isService
    ? "Servicos do Catalogo"
    : isProduct
      ? "Produtos do Catalogo"
      : "Itens do Catalogo";
  const ItemIcon = isService ? Wrench : Package;

  function CategoryFilter({
    value,
    onChange,
  }: {
    value: number | null;
    onChange: (id: number | null) => void;
  }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const selected = value ? categories.find((c) => c.id === value) : null;
    const filtered = searchValue
      ? categories.filter((c) =>
          c.name.toLowerCase().includes(searchValue.toLowerCase()),
        )
      : categories;

    const options = [
      {
        id: null as number | null,
        name: "Todas as categorias",
        photo: null as string | null,
      },
      ...filtered.map((cat) => ({
        id: cat.id,
        name: cat.name,
        photo: cat.photo ?? null,
      })),
    ];

    function selectOption(id: number | null) {
      onChange(id);
      setSearchValue("");
      setOpen(false);
      setHighlightedIndex(0);
      inputRef.current?.focus();
    }

    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={open ? searchValue : selected?.name ?? (value ? `ID ${value}` : "")}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setOpen(true);
            setHighlightedIndex(0);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!open) {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                setOpen(true);
                setHighlightedIndex(0);
                e.preventDefault();
              }
              return;
            }

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
              return;
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedIndex((prev) => Math.max(prev - 1, 0));
              return;
            }

            if (e.key === "Enter") {
              e.preventDefault();
              const option = options[highlightedIndex];
              if (option) {
                selectOption(option.id);
              }
              return;
            }

            if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
            }
          }}
          placeholder="Buscar categoria..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        />
        {open && (
          <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-card shadow-lg">
            {options.map((option, index) => (
              <button
                key={option.id ?? "all"}
                type="button"
                className={`w-full px-3 py-3 text-left text-sm transition-colors ${
                  highlightedIndex === index ? "bg-accent" : "hover:bg-accent"
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(option.id);
                }}
              >
                <span className="flex min-h-10 items-center gap-3">
                  {option.photo ? (
                    <img
                      src={option.photo}
                      alt={option.name}
                      className="h-10 w-10 rounded-md border border-border object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted">
                      <Tag size={14} className="text-muted-foreground" />
                    </span>
                  )}
                  <span>{option.name}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function handleApplyFilters() {
    setFilters(draftFilters);
    setPage(0);
  }

  function handleClearFilter() {
    const cleared = { q: "", categoryId: "" };
    setDraftFilters(cleared);
    setFilters(cleared);
    setPage(0);
  }

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Item excluido com sucesso.");
    } catch {
      toast.error("Erro ao excluir item.");
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
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalElements} {itemLabel} cadastrados
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            void navigate(
              typeFilter
                ? `${basePath}/new?type=${typeFilter}`
                : "/catalog/items/new",
            )
          }
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Novo {itemLabelSingular}
        </button>
      </div>

      {/* Filters */}
      <FilterBar onClear={handleClearFilter} activeCount={activeFilterCount}>
        <div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Buscar por nome</label>
            <input
              type="text"
              value={draftFilters.q}
              onChange={(e) =>
                setDraftFilters((prev) => ({ ...prev, q: e.target.value }))
              }
              placeholder={`Buscar ${itemLabelSingular}...`}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 w-full"
            />
          </div>
        </div>
        <div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Categoria</label>
            <CategoryFilter
              value={draftFilters.categoryId ? Number(draftFilters.categoryId) : null}
              onChange={(id) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  categoryId: id ? String(id) : "",
                }))
              }
            />
          </div>
        </div>
        {!typeFilter && (
          <div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Tipo</label>
              <input
                type="text"
                value={isProduct ? "Produto" : isService ? "Servico" : "Todos"}
                readOnly
                className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm w-full"
              />
            </div>
          </div>
        )}
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
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                SKU
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
              Array.from({ length: 6 }).map((_, i) => (
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
                  Erro ao carregar {itemLabel}.
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ItemIcon size={32} className="text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum {itemLabelSingular} encontrado.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        void navigate(
                          typeFilter
                            ? `${basePath}/new?type=${typeFilter}`
                            : "/catalog/items/new",
                        )
                      }
                      className="text-xs text-primary hover:underline"
                    >
                      Criar primeiro {itemLabelSingular}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                        <ItemIcon size={14} className="text-muted-foreground" />
                      </div>
                      <p className="font-medium">{item.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.categoryName ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px]">
                        <Tag size={9} />
                        {item.categoryName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {item.sku ?? <span className="text-muted-foreground/50">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={item.active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          void navigate(
                            typeFilter
                              ? `${basePath}/${item.id}/edit`
                              : `/catalog/items/${item.id}/edit`,
                          )
                        }
                        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteId(item.id);
                          setDeleteName(item.name);
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
