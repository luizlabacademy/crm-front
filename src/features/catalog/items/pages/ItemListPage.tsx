import { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { Plus, Search, Pencil, Trash2, Package, Tag, Wrench } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ActiveBadge } from "@/components/shared/ActiveBadge";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import { TablePagination } from "@/components/shared/TablePagination";
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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const { data, isLoading, isError } = useItems({
    page,
    size: pageSize,
    type: typeFilter ?? undefined,
    search: search || undefined,
    categoryId: categoryFilter ?? undefined,
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={`Buscar ${itemLabelSingular}...`}
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter(null);
                setPage(0);
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                categoryFilter === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat.id === categoryFilter ? null : cat.id);
                  setPage(0);
                }}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  categoryFilter === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                <Tag size={10} />
                {cat.name}
              </button>
            ))}
          </div>
        )}
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
