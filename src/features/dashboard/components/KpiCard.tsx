import { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, RefreshCw } from "lucide-react";
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
  trendPercent?: number;
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
  trendPercent,
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
  const hasTrend = typeof trendPercent === "number";
  const isTrendUp = (trendPercent ?? 0) >= 0;
  const trendText = `${isTrendUp ? "" : "-"}${Math.abs(trendPercent ?? 0).toFixed(1)}%`;
  const trendToneClass = isTrendUp ? "text-emerald-600" : "text-red-500";
  const largeValueSizeClass =
    visibleValueLength >= 14
      ? "text-base sm:text-lg xl:text-xl"
      : visibleValueLength >= 12
        ? "text-lg sm:text-xl xl:text-2xl"
        : "text-xl md:text-2xl xl:text-[1.65rem]";

  if (variant === "compact") {
    return (
      <div className="relative rounded-lg border border-border/80 bg-card p-4 shadow-sm flex flex-col gap-2.5">
        {!isError && !isLoading && (
          <button
            type="button"
            onClick={toggleVisibility}
            aria-label={visible ? "Ocultar valor" : "Mostrar valor"}
            className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}

        <div className="flex min-w-0 items-center gap-2 pr-6">
          {Icon && (
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <Icon size={12} strokeWidth={1.7} />
            </span>
          )}
          <span className="truncate text-sm font-normal text-muted-foreground">
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
          <>
            <p
              className={cn(
                "text-4xl font-medium leading-none tracking-tight tabular-nums",
                !visible && "select-none",
              )}
            >
              {visible ? displayValue : HIDDEN_VALUE}
            </p>
            {hasTrend && (
              <p
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  trendToneClass,
                )}
              >
                {isTrendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {trendText}
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative rounded-lg border border-border/80 bg-card p-4 shadow-sm">
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
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="inline-flex h-11 w-11 xl:h-14 xl:w-14 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground">
              <Icon
                size={22}
                strokeWidth={1.8}
                className="xl:h-[28px] xl:w-[28px]"
              />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "whitespace-nowrap font-medium leading-none tracking-tight",
                largeValueSizeClass,
                !visible && "select-none",
              )}
            >
              {visible ? displayValue : HIDDEN_VALUE}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <p className="truncate text-sm font-normal text-muted-foreground">
                {label}
              </p>
              {hasTrend && (
                <p
                  className={cn(
                    "shrink-0 flex items-center gap-1 text-xs font-semibold",
                    trendToneClass,
                  )}
                >
                  {isTrendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {trendText}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
