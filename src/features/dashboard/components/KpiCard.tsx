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
      ? "md:text-base lg:text-lg xl:text-xl"
      : visibleValueLength >= 12
        ? "md:text-lg lg:text-xl xl:text-2xl"
        : "md:text-xl lg:text-2xl xl:text-[1.65rem]";

  if (variant === "compact") {
    return (
      <div className="relative flex flex-col gap-3 rounded-md border border-border/80 bg-card p-5 shadow-sm md:p-4">
        {!isError && !isLoading && (
          <button
            type="button"
            onClick={toggleVisibility}
            aria-label={visible ? "Ocultar valor" : "Mostrar valor"}
            className="absolute right-3.5 top-3.5 text-foreground/55 hover:text-foreground transition-colors"
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}

        <div className="flex min-w-0 items-center gap-2 pr-6">
          {Icon && (
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/70 text-foreground/70 md:h-6 md:w-6">
              <Icon size={14} strokeWidth={1.7} className="md:h-3 md:w-3" />
            </span>
          )}
          <span className="truncate text-base font-medium text-foreground/75 md:text-sm">
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
            <div className="flex items-end justify-between gap-2">
              <p
                className={cn(
                  "text-4xl font-semibold leading-none tracking-tight tabular-nums text-foreground",
                  !visible && "select-none",
                )}
              >
                {visible ? displayValue : HIDDEN_VALUE}
              </p>
              {hasTrend && (
                <p
                  className={cn(
                    "mb-1 flex shrink-0 items-center gap-1 text-xs font-semibold",
                    trendToneClass,
                  )}
                >
                  {isTrendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {trendText}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative rounded-md border border-border/80 bg-card p-5 shadow-sm md:p-4">
      {!isError && !isLoading && (
        <button
          type="button"
          onClick={toggleVisibility}
          aria-label={visible ? "Ocultar valor" : "Mostrar valor"}
          className="absolute right-4 top-4 text-foreground/55 hover:text-foreground transition-colors"
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
            <span className="inline-flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl bg-muted/75 text-foreground/75 md:h-11 md:w-11 xl:h-14 xl:w-14">
              <Icon
                size={30}
                strokeWidth={1.8}
                className="md:h-[22px] md:w-[22px] xl:h-[28px] xl:w-[28px]"
              />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "whitespace-nowrap text-4xl font-semibold leading-none tracking-tight text-foreground",
                largeValueSizeClass,
                !visible && "select-none",
              )}
            >
              {visible ? displayValue : HIDDEN_VALUE}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <p className="truncate text-base font-medium text-foreground/75 md:text-sm">
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
