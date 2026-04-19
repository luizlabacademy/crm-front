import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { CampaignFilterDropdown } from "@/features/dashboard/components/CampaignFilterDropdown";
import {
  CAMPAIGN_OPTIONS,
  getCampaignWeightRatio,
} from "@/features/dashboard/constants/campaignFilter";
import {
  getDefaultDashboardChartType,
  setDefaultDashboardChartType,
  type DashboardChartType,
} from "@/lib/dashboardChartTypePreference";
import type { ConversionPeriod } from "@/features/dashboard/types/dashboardTypes";
import {
  type ChartMode,
  CHART_MODE_OPTIONS,
  PERIOD_OPTIONS,
  CHART_VIEW_OPTIONS,
  MONTH_LABELS_LONG,
  DASHBOARD_PERIOD_STORAGE_KEY,
  brlFormatter,
  countFormatter,
} from "@/features/dashboard/constants/chartConfig";
import {
  generateDailyData,
  generateMonthlyData,
  generateYearlyData,
} from "@/features/dashboard/utils/syntheticData";

// ─── Period preference ───────────────────────────────────────────────────────

function getDefaultConversionPeriod(): ConversionPeriod {
  try {
    const storedValue = localStorage.getItem(DASHBOARD_PERIOD_STORAGE_KEY);
    if (
      storedValue === "daily" ||
      storedValue === "monthly" ||
      storedValue === "yearly"
    ) {
      return storedValue;
    }
  } catch {
    // ignore read errors and fallback to default
  }

  return "daily";
}

function setDefaultConversionPeriod(period: ConversionPeriod) {
  try {
    localStorage.setItem(DASHBOARD_PERIOD_STORAGE_KEY, period);
  } catch {
    // ignore persistence errors
  }
}

// ─── Custom tooltip ──────────────────────────────────────────────────────────

interface TooltipPayload {
  value: number;
  payload: { label: string; value: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  periodLabel: string;
  chartLabel: string;
  mode: ChartMode;
}

function CustomTooltip({
  active,
  payload,
  label,
  periodLabel,
  chartLabel,
  mode,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">
        {mode === "conversion"
          ? `${value}%`
          : mode === "sales" || mode === "expenses"
            ? brlFormatter.format(value)
            : countFormatter.format(value)}
      </p>
      <p className="text-[11px] text-muted-foreground">
        {chartLabel} ({periodLabel})
      </p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ConversionRateChart() {
  const now = useMemo(() => new Date(), []);
  const [mode, setMode] = useState<ChartMode>("sales");
  const [chartView, setChartView] = useState<DashboardChartType>(() =>
    getDefaultDashboardChartType(),
  );
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [period, setPeriod] = useState<ConversionPeriod>(() =>
    getDefaultConversionPeriod(),
  );
  const [referenceDate, setReferenceDate] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(
    CAMPAIGN_OPTIONS.map((campaign) => campaign.id),
  );
  const modeMenuRef = useRef<HTMLDivElement | null>(null);

  const selectedYear = referenceDate.getFullYear();
  const selectedMonth = referenceDate.getMonth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!modeMenuRef.current) return;
      if (modeMenuRef.current.contains(event.target as Node)) return;
      setModeMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setDefaultConversionPeriod(period);
  }, [period]);

  const rawData = useMemo(() => {
    if (period === "daily") {
      return generateDailyData(mode, selectedYear, selectedMonth);
    }
    if (period === "monthly") {
      return generateMonthlyData(mode, selectedYear);
    }
    return generateYearlyData(mode, now);
  }, [mode, now, period, selectedMonth, selectedYear]);

  const filteredData = useMemo(() => {
    const ratio =
      mode === "expenses" ? 1 : getCampaignWeightRatio(selectedCampaigns);
    return rawData.map((point) => ({
      ...point,
      value:
        mode === "conversion"
          ? Number((point.value * ratio).toFixed(2))
          : Math.round(point.value * ratio),
    }));
  }, [mode, rawData, selectedCampaigns]);

  const activePeriodLabel =
    PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? "Mensal";
  const activeChartLabel =
    CHART_MODE_OPTIONS.find((option) => option.value === mode)?.label ??
    "Curva de Conversão";

  const navigationTitle =
    period === "daily"
      ? `${MONTH_LABELS_LONG[selectedMonth]} ${selectedYear}`
      : String(selectedYear);

  const activeMode = CHART_MODE_OPTIONS.find((option) => option.value === mode);

  function formatYAxisValue(value: number): string {
    if (mode === "conversion") return `${value}%`;
    if (mode === "sales" || mode === "expenses")
      return brlFormatter.format(value);
    return countFormatter.format(value);
  }

  function goPrevious() {
    if (period === "daily") {
      setReferenceDate(new Date(selectedYear, selectedMonth - 1, 1));
      return;
    }
    if (period === "monthly") {
      setReferenceDate(new Date(selectedYear - 1, selectedMonth, 1));
    }
  }

  function goNext() {
    if (period === "daily") {
      setReferenceDate(new Date(selectedYear, selectedMonth + 1, 1));
      return;
    }
    if (period === "monthly") {
      setReferenceDate(new Date(selectedYear + 1, selectedMonth, 1));
    }
  }

  function handleChartViewChange(value: DashboardChartType) {
    setChartView(value);
    setDefaultDashboardChartType(value);
  }

  return (
    <div className="self-start rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between gap-2">
        <div ref={modeMenuRef} className="relative inline-flex items-center">
          <button
            type="button"
            onClick={() => setModeMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 bg-transparent py-0 text-[15px] font-semibold tracking-tight text-foreground"
          >
            {activeMode?.label ?? "Desempenho de Vendas"}
            <ChevronDown
              size={18}
              strokeWidth={2.4}
              className="text-foreground/80"
            />
          </button>

          {modeMenuOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 min-w-64 rounded-md border border-border bg-popover p-1 shadow-lg">
              {CHART_MODE_OPTIONS.map((option) => {
                const isActive = option.value === mode;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setMode(option.value);
                      setModeMenuOpen(false);
                    }}
                    className={[
                      "flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-foreground hover:bg-accent/70",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={
              mode === "expenses" ? "invisible pointer-events-none" : ""
            }
          >
            <CampaignFilterDropdown
              options={CAMPAIGN_OPTIONS}
              selectedIds={selectedCampaigns}
              onChange={setSelectedCampaigns}
            />
          </div>
          <select
            value={chartView}
            onChange={(event) =>
              handleChartViewChange(event.target.value as DashboardChartType)
            }
            className="rounded-md border border-input bg-background px-2.5 py-1 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
            aria-label="Tipo de gráfico"
          >
            {CHART_VIEW_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full bg-muted p-1">
            {PERIOD_OPTIONS.map((opt) => {
              const isActive = period === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPeriod(opt.value)}
                  className={[
                    "rounded-full px-5 py-1.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground/65 hover:text-foreground",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {(period === "daily" || period === "monthly") && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <button
                type="button"
                onClick={goPrevious}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Período anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="min-w-28 text-center text-sm font-semibold text-foreground">
                {navigationTitle}
              </span>

              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Próximo período"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {chartView === "area" ? (
            <AreaChart
              data={filteredData}
              margin={{ top: 5, right: 10, left: 8, bottom: 0 }}
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
                tick={{
                  fontSize: 12,
                  fill: "var(--muted-foreground)",
                  fontWeight: 500,
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontSize: 12,
                  fill: "var(--muted-foreground)",
                  fontWeight: 500,
                }}
                width={88}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxisValue}
                domain={[0, "auto"]}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    periodLabel={activePeriodLabel}
                    chartLabel={activeChartLabel}
                    mode={mode}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#66BB6A"
                strokeWidth={2}
                fill="url(#conversionGradient)"
              />
            </AreaChart>
          ) : chartView === "line" ? (
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 10, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{
                  fontSize: 12,
                  fill: "var(--muted-foreground)",
                  fontWeight: 500,
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontSize: 12,
                  fill: "var(--muted-foreground)",
                  fontWeight: 500,
                }}
                width={88}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxisValue}
                domain={[0, "auto"]}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    periodLabel={activePeriodLabel}
                    chartLabel={activeChartLabel}
                    mode={mode}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#66BB6A"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          ) : (
            <BarChart
              data={filteredData}
              margin={{ top: 5, right: 10, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{
                  fontSize: 12,
                  fill: "var(--muted-foreground)",
                  fontWeight: 500,
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontSize: 12,
                  fill: "var(--muted-foreground)",
                  fontWeight: 500,
                }}
                width={88}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxisValue}
                domain={[0, "auto"]}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    periodLabel={activePeriodLabel}
                    chartLabel={activeChartLabel}
                    mode={mode}
                  />
                }
              />
              <Bar dataKey="value" fill="#66BB6A" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
