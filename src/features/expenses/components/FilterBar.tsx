import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  children: ReactNode;
  onClear: () => void;
  activeCount?: number;
}

export function FilterBar({
  children,
  onClear,
  activeCount = 0,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          Filtros
          {activeCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
              {activeCount}
            </span>
          )}
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <div
        className={cn(
          "transition-all duration-200",
          expanded
            ? "max-h-[500px] opacity-100 overflow-visible"
            : "max-h-0 opacity-0 overflow-hidden",
        )}
      >
        <div className="border-t border-border px-4 py-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {children}
          </div>
          {activeCount > 0 && (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
