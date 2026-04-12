import { useEffect, useState } from "react";
import { getFunnelData } from "@/features/dashboard/api/dashboardMockService";
import { MetricSummaryCard } from "@/features/dashboard/components/MetricSummaryCard";
import type {
  FunnelData,
  FunnelPeriod,
  FunnelStep,
} from "@/features/dashboard/types/dashboardTypes";

const FUNNEL_PERIOD_OPTIONS: { value: FunnelPeriod; label: string }[] = [
  { value: "30d", label: "Ultimos 30 dias" },
  { value: "60d", label: "Ultimos 60 dias" },
  { value: "90d", label: "Ultimo 90 dias" },
  { value: "180d", label: "Ultimos 180 dias" },
  { value: "1y", label: "Ultimo Ano" },
  { value: "2y", label: "Ultimos 2 anos" },
  { value: "5y", label: "Ultimos 5 anos" },
  { value: "all", label: "Todos" },
];

// ─── Funnel step bar ─────────────────────────────────────────────────────────

interface FunnelStepBarProps {
  step: FunnelStep;
  maxValue: number;
  index: number;
  total: number;
}

function FunnelStepBar({ step, maxValue, index, total }: FunnelStepBarProps) {
  // Width decreases from 100% to a minimum as the funnel narrows
  const minWidthPct = 30;
  const widthPct =
    total > 1 ? 100 - ((100 - minWidthPct) * index) / (total - 1) : 100;

  // Height of each bar proportional to value, with a minimum
  const barHeight = Math.max((step.value / maxValue) * 56, 36);

  return (
    <div className="flex items-center gap-2">
      {/* Funnel bar */}
      <div className="flex-1 flex justify-center">
        <div
          className="relative flex items-center justify-center rounded-md transition-all duration-300"
          style={{
            width: `${widthPct}%`,
            height: `${barHeight}px`,
            backgroundColor: step.color,
          }}
        >
          <div className="flex flex-col items-center text-white">
            <span className="text-xs font-medium leading-none">
              {step.label}
            </span>
            <span className="text-sm font-bold leading-tight">
              {new Intl.NumberFormat("pt-BR").format(step.value)}
            </span>
          </div>
        </div>
      </div>

      {/* Connector line */}
      <div
        className="h-px w-10 shrink-0"
        style={{ backgroundColor: step.color }}
      />

      {/* Percentage indicator */}
      <div className="flex items-center gap-2 w-16 shrink-0">
        <div
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: step.color }}
        />
        <span className="text-sm font-semibold text-muted-foreground">
          {step.percentage}%
        </span>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function FunnelSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="flex-1 flex justify-center">
            <div
              className="h-10 animate-pulse rounded-md bg-muted"
              style={{ width: `${100 - i * 10}%` }}
            />
          </div>
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

// ─── Main panel ──────────────────────────────────────────────────────────────

export function FunnelPanel() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [period, setPeriod] = useState<FunnelPeriod>("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFunnelData(period)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const maxValue = data ? Math.max(...data.steps.map((s) => s.value), 1) : 1;

  return (
    <div className="rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Funil de Conversão</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as FunnelPeriod)}
          className="rounded-md border border-border bg-background px-2.5 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring transition-colors"
        >
          {FUNNEL_PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="p-5">
        {loading ? (
          <FunnelSkeleton />
        ) : data ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_200px]">
            {/* Funnel visualization */}
            <div className="space-y-2">
              {data.steps.map((step, i) => (
                <FunnelStepBar
                  key={step.id}
                  step={step}
                  maxValue={maxValue}
                  index={i}
                  total={data.steps.length}
                />
              ))}
            </div>

            {/* Summary cards */}
            <div className="flex flex-col gap-3">
              {data.summary.map((metric) => (
                <MetricSummaryCard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">
            Erro ao carregar funil.
          </p>
        )}
      </div>
    </div>
  );
}
