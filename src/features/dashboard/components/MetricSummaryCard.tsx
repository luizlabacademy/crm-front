import type { FunnelSummaryMetric } from "@/features/dashboard/types/dashboardTypes";

interface MetricSummaryCardProps {
  metric: FunnelSummaryMetric;
}

export function MetricSummaryCard({ metric }: MetricSummaryCardProps) {
  return (
    <div className="rounded-xl bg-muted/65 px-4 py-[0.72rem] flex flex-col items-center justify-center gap-1 text-center">
      <span className="text-xs font-medium text-foreground/70">
        {metric.label}
      </span>
      <span
        className="text-2xl font-semibold tracking-tight"
        style={metric.color ? { color: metric.color } : undefined}
      >
        {metric.value}
      </span>
    </div>
  );
}
