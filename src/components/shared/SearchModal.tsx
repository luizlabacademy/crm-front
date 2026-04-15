import { useEffect } from "react";
import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function SearchModal({
  open,
  title,
  description,
  placeholder = "Buscar...",
  query,
  onQueryChange,
  onClose,
  children,
  className,
}: SearchModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div
        className={cn(
          "w-full max-w-2xl rounded-xl border border-border bg-card shadow-lg",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={placeholder}
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">{children}</div>
      </div>
    </div>
  );
}
