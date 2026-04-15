import { useCallback, useEffect, useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const getSearchableItems = useCallback(() => {
    if (!resultsRef.current) return [];
    return Array.from(
      resultsRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [role="option"]:not([aria-disabled="true"])',
      ),
    );
  }, []);

  const moveActive = useCallback(
    (direction: 1 | -1) => {
      const items = getSearchableItems();
      if (items.length === 0) return;

      const nextIndex =
        activeIndex < 0
          ? direction > 0
            ? 0
            : items.length - 1
          : (activeIndex + direction + items.length) % items.length;

      setActiveIndex(nextIndex);
      const target = items[nextIndex];
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "nearest" });
    },
    [activeIndex, getSearchableItems],
  );

  const triggerActiveItem = useCallback(() => {
    const items = getSearchableItems();
    if (items.length === 0) return;

    const target = activeIndex >= 0 ? items[activeIndex] : items[0];
    target.click();
  }, [activeIndex, getSearchableItems]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(-1);
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      triggerActiveItem();
    }
  }

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
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={placeholder}
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
          </div>
        </div>

        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto p-2">
          {children}
        </div>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px]">
              ↑
            </kbd>
            <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px]">
              ↓
            </kbd>
            <span>Selecionar</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px]">
              Enter
            </kbd>
            <span>Abrir</span>
          </span>
        </div>
      </div>
    </div>
  );
}
