import { ChevronUp, ChevronDown, Pencil, Loader2, Tag, Globe } from "lucide-react";
import type { ItemCategoryResponse } from "@/features/catalog/categories/types/itemCategoryTypes";

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ active, showOnSite }: { active?: boolean | null; showOnSite?: boolean | null }) {
  if (active === false) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground">
        Desativado | Não exibir no site
      </span>
    );
  }

  if (showOnSite) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-100 text-emerald-700">
        Ativo | Exibir no site
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground">
      Ativo | Não exibir no site
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ItemCategoryListTableProps {
  categories: ItemCategoryResponse[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (category: ItemCategoryResponse) => void;
  onMoveUp: (id: number) => Promise<void>;
  onMoveDown: (id: number) => Promise<void>;
  reorderingAction: { id: number; direction: "up" | "down" } | null;
  emptyIcon?: "tag" | "globe";
  emptyMessage?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ItemCategoryListTable({
  categories,
  isLoading,
  isError,
  onEdit,
  onMoveUp,
  onMoveDown,
  reorderingAction,
  emptyIcon = "tag",
  emptyMessage = "Nenhuma categoria encontrada.",
}: ItemCategoryListTableProps) {
  const EmptyIcon = emptyIcon === "tag" ? Tag : Globe;

  return (
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
          ) : categories.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <EmptyIcon size={32} className="text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {emptyMessage}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            categories.map((cat, index) => {
              const isMovingUp = reorderingAction?.id === cat.id && reorderingAction.direction === "up";
              const isMovingDown = reorderingAction?.id === cat.id && reorderingAction.direction === "down";
              const isReordering = reorderingAction !== null;

              return (
                <tr
                  key={cat.id}
                  className="cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => onEdit(cat)}
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
                        <EmptyIcon size={14} className="text-muted-foreground" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{cat.name}</div>
                    <div className="mt-1">
                      <StatusBadge active={cat.active} showOnSite={cat.showOnSite} />
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {cat.description?.trim() || (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void onMoveUp(cat.id);
                        }}
                        disabled={isReordering || index === 0}
                        className="rounded-md p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
                        title="Mover para cima"
                      >
                        {isMovingUp ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ChevronUp size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void onMoveDown(cat.id);
                        }}
                        disabled={isReordering || index === categories.length - 1}
                        className="rounded-md p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
                        title="Mover para baixo"
                      >
                        {isMovingDown ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(cat);
                        }}
                        className="rounded-md p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
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
  );
}
