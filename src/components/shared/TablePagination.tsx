import { Button } from "@/components/shared/Button";

interface TablePaginationProps {
  /** Índice da página atual (base zero). */
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  /** Opcional: exibe o total de registros. */
  totalElements?: number;
}

export function TablePagination({
  page,
  totalPages,
  onPrev,
  onNext,
  totalElements,
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <span>
        Página {page + 1} de {totalPages}
        {totalElements !== undefined && ` · ${totalElements} registros`}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={onPrev}
          disabled={page === 0}
          aria-label="Página anterior"
        >
          Anterior
        </Button>
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={onNext}
          disabled={page >= totalPages - 1}
          aria-label="Próxima página"
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
