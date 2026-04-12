import type { FunnelSummaryMetric } from "@/features/dashboard/types/dashboardTypes";

interface MetricSummaryCardProps {
  metric: FunnelSummaryMetric;
}

export function MetricSummaryCard({ metric }: MetricSummaryCardProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm flex flex-col items-center justify-center gap-1 text-center">
      <span className="text-xs font-medium text-muted-foreground">
        {metric.label}
      </span>
      <span
        className="text-2xl font-bold tracking-tight"
        style={metric.color ? { color: metric.color } : undefined}
      >
        {metric.value}
      </span>
    </div>
  );
}
