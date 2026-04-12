import { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, HIDDEN_VALUE } from "@/lib/utils/formatCurrency";

interface KpiCardProps {
  label: string;
  value: number;
  type: "currency" | "count";
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

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        {!isError && !isLoading && (
          <button
            type="button"
            onClick={toggleVisibility}
            aria-label={visible ? "Ocultar valor" : "Mostrar valor"}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted" />
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
            "text-2xl font-semibold tracking-tight tabular-nums",
            !visible && "select-none",
          )}
        >
          {visible ? displayValue : HIDDEN_VALUE}
        </p>
      )}
    </div>
  );
}
