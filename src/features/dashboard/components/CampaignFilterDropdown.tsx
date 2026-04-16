import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Search } from "lucide-react";
import type { CampaignFilterOption } from "@/features/dashboard/constants/campaignFilter";
import { cn } from "@/lib/utils";

interface CampaignFilterDropdownProps {
  options: CampaignFilterOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CampaignFilterDropdown({
  options,
  selectedIds,
  onChange,
}: CampaignFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => {
      return option.label.toLowerCase().includes(query);
    });
  }, [options, search]);

  const allIds = useMemo(() => {
    return options.map((option) => option.id);
  }, [options]);

  const allSelected =
    selectedIds.length === 0 || selectedIds.length === options.length;

  const effectiveSelectedIds = allSelected ? allIds : selectedIds;

  useEffect(() => {
    if (!open) return;
    const timeoutId = window.setTimeout(() => {
      searchRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [open]);

  useEffect(() => {
    if (activeIndex <= filteredOptions.length - 1) return;
    setActiveIndex(0);
  }, [activeIndex, filteredOptions.length]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOption(id: string) {
    const currentIds = effectiveSelectedIds;
    onChange(
      currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id],
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!filteredOptions.length) return;
      setActiveIndex((prev) => (prev + 1) % filteredOptions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!filteredOptions.length) return;
      setActiveIndex((prev) =>
        prev === 0 ? filteredOptions.length - 1 : prev - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const active = filteredOptions[activeIndex];
      if (active) toggleOption(active.id);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-md border border-border bg-background px-2.5 py-1 text-sm text-foreground hover:bg-accent transition-colors"
      >
        Campanhas ({allSelected ? "Todas" : effectiveSelectedIds.length})
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-72 rounded-md border border-border bg-popover p-3 shadow-lg">
          <div className="relative mb-2">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={searchRef}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setActiveIndex(0);
              }}
              placeholder="Buscar campanhas..."
              className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-2.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="mb-2 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => onChange(options.map((option) => option.id))}
              className="text-muted-foreground hover:text-foreground"
            >
              Marcar todas
            </button>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpar
            </button>
          </div>

          <div className="max-h-56 space-y-1 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="rounded px-2 py-1.5 text-sm text-muted-foreground">
                Nenhuma campanha encontrada.
              </p>
            ) : (
              filteredOptions.map((option, index) => {
                const checked = effectiveSelectedIds.includes(option.id);
                const active = index === activeIndex;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => toggleOption(option.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors",
                      active ? "bg-accent" : "hover:bg-accent/70",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="h-4 w-4 accent-primary"
                    />
                    <span>{option.label}</span>
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-muted text-[11px] leading-none">
                ↑
              </span>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-muted text-[11px] leading-none">
                ↓
              </span>
              <span className="text-xs">Selecionar</span>
              <span className="inline-flex h-5 items-center rounded-md border border-border bg-muted px-2 text-[11px] leading-none">
                Enter
              </span>
              <span className="text-xs">Marcar</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
