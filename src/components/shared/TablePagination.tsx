import { Button } from "@/components/shared/Button";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination/pageSizePreference";

interface TablePaginationProps {
  /** Índice da página atual (base zero). */
  page: number;
  totalPages: number;
  onFirst?: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast?: () => void;
  /** Opcional: exibe o total de registros. */
  totalElements?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export function TablePagination({
  page,
  totalPages,
  onFirst,
  onPrev,
  onNext,
  onLast,
  totalElements,
  pageSize,
  pageSizeOptions = [...PAGE_SIZE_OPTIONS],
  onPageSizeChange,
}: TablePaginationProps) {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const currentPage = Math.min(page + 1, Math.max(totalPages, 1));
  const hasElements = totalElements !== undefined && totalElements > 0;
  const rangeStart =
    hasElements && pageSize ? page * pageSize + 1 : hasElements ? page + 1 : 0;
  const rangeEnd =
    hasElements && pageSize
      ? Math.min((page + 1) * pageSize, totalElements)
      : hasElements && totalElements
        ? Math.min(page + 1, totalElements)
        : 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <span>
        {hasElements
          ? `${rangeStart}-${rangeEnd} de ${totalElements} registros`
          : "0 registros"}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && pageSize !== undefined && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Por página</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
              aria-label="Quantidade de registros por página"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          className="rounded-sm"
          onClick={onFirst ?? onPrev}
          disabled={page <= 0}
          aria-label="Primeira página"
        >
          <ChevronsLeft />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          className="rounded-sm"
          onClick={onPrev}
          disabled={page <= 0}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </Button>
        <span className="min-w-11 rounded-md border border-border bg-background px-3 py-1.5 text-center text-sm font-medium text-foreground">
          {currentPage}
        </span>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          className="rounded-sm"
          onClick={onNext}
          disabled={page >= Math.max(totalPages - 1, 0)}
          aria-label="Próxima página"
        >
          <ChevronRight />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          className="rounded-sm"
          onClick={onLast ?? onNext}
          disabled={page >= Math.max(totalPages - 1, 0)}
          aria-label="Última página"
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
