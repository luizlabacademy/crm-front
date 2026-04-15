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
        <button
          type="button"
          onClick={onPrev}
          disabled={page === 0}
          aria-label="Página anterior"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent transition-colors disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages - 1}
          aria-label="Próxima página"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent transition-colors disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
