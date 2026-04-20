import { useState } from "react";
import { Search, Ruler } from "lucide-react";
import { ActiveBadge } from "@/components/shared/ActiveBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { useUnitsOfMeasure } from "@/features/catalog/units-of-measure/api/useUnitsOfMeasure";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

export function UnitOfMeasureListPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useUnitsOfMeasure({
    page,
    size: pageSize,
  });

  const units = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const filtered = units.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.symbol ?? "").toLowerCase().includes(q) ||
      u.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Unidades de Medida</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {totalElements} unidade{totalElements !== 1 ? "s" : ""} cadastrada
          {totalElements !== 1 ? "s" : ""}
        </p>
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
          placeholder="Buscar por nome ou símbolo..."
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Código
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Símbolo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <p className="text-sm text-destructive mb-2">
                    Erro ao carregar unidades de medida.
                  </p>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="text-xs text-primary hover:underline"
                  >
                    Tentar novamente
                  </button>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Ruler size={32} className="text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma unidade de medida encontrada.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((unit) => (
                <tr
                  key={unit.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {unit.code}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted shrink-0">
                        <Ruler size={12} className="text-muted-foreground" />
                      </div>
                      <span className="font-medium">{unit.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {unit.symbol ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={unit.active} />
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
