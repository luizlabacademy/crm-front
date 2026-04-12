import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getConversionRateData } from "@/features/dashboard/api/dashboardMockService";
import type {
  ConversionPeriod,
  ConversionDataPoint,
} from "@/features/dashboard/types/dashboardTypes";

// ─── Period selector ─────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { value: ConversionPeriod; label: string }[] = [
  { value: "daily", label: "Dia" },
  { value: "monthly", label: "Mês" },
  { value: "yearly", label: "Ano" },
];

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="h-[300px] w-full flex items-end gap-1 px-4 pb-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse rounded-t bg-muted"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  );
}

// ─── Custom tooltip ──────────────────────────────────────────────────────────

interface TooltipPayload {
  value: number;
  payload: ConversionDataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{payload[0].value}%</p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ConversionRateChart() {
  const [period, setPeriod] = useState<ConversionPeriod>("monthly");
  const [data, setData] = useState<ConversionDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getConversionRateData(period)
      .then((result) => {
        if (!cancelled) setData(result.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold">Curva de Conversão</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as ConversionPeriod)}
          className="rounded-md border border-border bg-background px-2.5 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring transition-colors"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="p-5">
        {loading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="conversionGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#66BB6A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#66BB6A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
                domain={[0, "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="conversionRate"
                stroke="#66BB6A"
                strokeWidth={2}
                fill="url(#conversionGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
