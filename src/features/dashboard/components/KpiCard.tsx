import { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, HIDDEN_VALUE } from "@/lib/utils/formatCurrency";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number;
  type: "currency" | "count";
  icon?: LucideIcon;
  variant?: "large" | "compact";
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  storageKey: string;
}

function getInitialVisibility(storageKey: string): boolean {
  try {
    const stored = localStorage.getItem(`dashboard_kpi_vis_${storageKey}`);
    return stored !== "hidden";
  } catch {
    return true;
  }
}

function setStoredVisibility(storageKey: string, visible: boolean) {
  try {
    localStorage.setItem(
      `dashboard_kpi_vis_${storageKey}`,
      visible ? "visible" : "hidden",
    );
  } catch {
    // ignore
  }
}

export function KpiCard({
  label,
  value,
  type,
  icon: Icon,
  variant = "compact",
  isLoading = false,
  isError = false,
  onRetry,
  storageKey,
}: KpiCardProps) {
  const [visible, setVisible] = useState(() =>
    getInitialVisibility(storageKey),
  );

  useEffect(() => {
    setStoredVisibility(storageKey, visible);
  }, [storageKey, visible]);

  function toggleVisibility() {
    setVisible((v) => !v);
  }

  const displayValue =
    type === "currency"
      ? formatCurrency(value)
      : new Intl.NumberFormat("pt-BR").format(value);

  const visibleValueLength = (visible ? displayValue : HIDDEN_VALUE).length;
  const largeValueSizeClass =
    visibleValueLength >= 14
      ? "text-lg sm:text-xl xl:text-2xl"
      : visibleValueLength >= 12
        ? "text-xl sm:text-2xl xl:text-[1.75rem]"
        : "text-2xl md:text-[1.75rem] xl:text-3xl";

  if (variant === "compact") {
    return (
      <div className="relative rounded-xl border border-border/80 bg-card p-5 shadow-sm flex flex-col gap-3">
        {!isError && !isLoading && (
          <button
            type="button"
            onClick={toggleVisibility}
            aria-label={visible ? "Ocultar valor" : "Mostrar valor"}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}

        <div className="flex min-w-0 items-center gap-2 pr-7">
          {Icon && (
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <Icon size={14} strokeWidth={1.8} />
            </span>
          )}
          <span className="truncate text-sm font-medium text-muted-foreground">
            {label}
          </span>
        </div>

        {isLoading ? (
          <div className="h-8 w-1/2 animate-pulse rounded-md bg-muted" />
        ) : isError ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-destructive">Erro ao carregar</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <RefreshCw size={11} />
                Tentar novamente
              </button>
            )}
          </div>
        ) : (
          <p
            className={cn(
              "text-4xl font-semibold leading-none tracking-tight tabular-nums",
              !visible && "select-none",
            )}
          >
            {visible ? displayValue : HIDDEN_VALUE}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      {!isError && !isLoading && (
        <button
          type="button"
          onClick={toggleVisibility}
          aria-label={visible ? "Ocultar valor" : "Mostrar valor"}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}

      {isLoading ? (
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 animate-pulse rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ) : isError ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-destructive">Erro ao carregar</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <RefreshCw size={11} />
              Tentar novamente
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="inline-flex h-12 w-12 xl:h-16 xl:w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
              <Icon
                size={24}
                strokeWidth={1.8}
                className="xl:h-[30px] xl:w-[30px]"
              />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "whitespace-nowrap font-semibold leading-none tracking-tight",
                largeValueSizeClass,
                !visible && "select-none",
              )}
            >
              {visible ? displayValue : HIDDEN_VALUE}
            </p>
            <p className="mt-2 truncate text-sm font-medium text-muted-foreground">
              {label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
