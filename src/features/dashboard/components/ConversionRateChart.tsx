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

// ─── Period selector ─────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { value: ConversionPeriod; label: string }[] = [
  { value: "daily", label: "Diária" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
];

const DASHBOARD_PERIOD_STORAGE_KEY = "dashboard_conversion_period";

function getDefaultConversionPeriod(): ConversionPeriod {
  try {
    const storedValue = localStorage.getItem(DASHBOARD_PERIOD_STORAGE_KEY);
    if (storedValue === "daily" || storedValue === "monthly" || storedValue === "yearly") {
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

const CHART_VIEW_OPTIONS: { value: DashboardChartType; label: string }[] = [
  { value: "area", label: "Area" },
  { value: "line", label: "Linhas" },
  { value: "bar", label: "Barras" },
];

type ChartMode =
  | "sales"
  | "expenses"
  | "leads"
  | "conversion"
  | "newCustomers"
  | "activeCustomers"
  | "servicesCompleted";

const CHART_MODE_OPTIONS: { value: ChartMode; label: string }[] = [
  { value: "sales", label: "Vendas" },
  { value: "expenses", label: "Despesas" },
  { value: "leads", label: "Leads" },
  { value: "conversion", label: "Conversão" },
  { value: "newCustomers", label: "Novos Clientes" },
  { value: "activeCustomers", label: "Clientes Ativos" },
  { value: "servicesCompleted", label: "Atendimentos" },
];

const MONTH_SEASONALITY = [
  0.92, 0.88, 0.96, 1.02, 1.04, 1.0, 0.98, 1.06, 1.01, 1.05, 1.14, 1.2,
];

const MODE_PROFILES: Record<
  ChartMode,
  {
    dailyBase: number;
    monthlyBase: number;
    yearlyBase: number;
    volatility: number;
    growth: number;
    seasonality: number;
  }
> = {
  sales: {
    dailyBase: 11500,
    monthlyBase: 260000,
    yearlyBase: 3100000,
    volatility: 0.12,
    growth: 0.05,
    seasonality: 0.12,
  },
  expenses: {
    dailyBase: 5200,
    monthlyBase: 125000,
    yearlyBase: 1500000,
    volatility: 0.09,
    growth: 0.038,
    seasonality: 0.08,
  },
  leads: {
    dailyBase: 38,
    monthlyBase: 940,
    yearlyBase: 11200,
    volatility: 0.14,
    growth: 0.045,
    seasonality: 0.14,
  },
  conversion: {
    dailyBase: 18,
    monthlyBase: 19,
    yearlyBase: 20,
    volatility: 0.08,
    growth: 0.012,
    seasonality: 0.08,
  },
  newCustomers: {
    dailyBase: 15,
    monthlyBase: 340,
    yearlyBase: 3900,
    volatility: 0.12,
    growth: 0.05,
    seasonality: 0.1,
  },
  activeCustomers: {
    dailyBase: 88,
    monthlyBase: 1850,
    yearlyBase: 20500,
    volatility: 0.07,
    growth: 0.042,
    seasonality: 0.05,
  },
  servicesCompleted: {
    dailyBase: 64,
    monthlyBase: 1450,
    yearlyBase: 17000,
    volatility: 0.1,
    growth: 0.047,
    seasonality: 0.09,
  },
};

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const countFormatter = new Intl.NumberFormat("pt-BR");

const MONTH_LABELS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const MONTH_LABELS_LONG = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// ─── Custom tooltip ──────────────────────────────────────────────────────────

interface TooltipPayload {
  value: number;
  payload: ChartPoint;
}

interface ChartPoint {
  label: string;
  value: number;
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

  function clampRate(value: number): number {
    return Math.max(4, Math.min(55, Number(value.toFixed(2))));
  }

  function clampSales(value: number): number {
    return Math.max(500, Math.round(value));
  }

  function clampCount(value: number): number {
    return Math.max(1, Math.round(value));
  }

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

  const rawData = useMemo<ChartPoint[]>(() => {
    const profile = MODE_PROFILES[mode];
    const BASE_YEAR = 2022;
    const GROWTH_BOOST = 2;

    function noise(seed: number): number {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return (x - Math.floor(x)) * 2 - 1;
    }

    function normalizeValue(value: number): number {
      if (mode === "conversion") return clampRate(value);
      if (mode === "sales" || mode === "expenses") return clampSales(value);
      return clampCount(value);
    }

    function annualRateForYear(year: number): number {
      const yearIndex = year - BASE_YEAR;
      const modeSeed = mode.charCodeAt(0) + mode.length * 17;
      const profileBaseGrowth = profile.growth;
      const baseRate =
        mode === "conversion"
          ? (0.05 + profileBaseGrowth * 0.7) * GROWTH_BOOST
          : (0.22 + profileBaseGrowth * 5.6) * GROWTH_BOOST;
      const cyclical =
        (Math.sin(yearIndex * 1.15 + modeSeed * 0.03) * 0.22 +
          Math.cos(yearIndex * 0.68 + modeSeed * 0.01) * 0.12) *
        GROWTH_BOOST;
      const randomSwing =
        noise(year * 41 + modeSeed) *
        (mode === "conversion" ? 0.08 : 0.32) *
        GROWTH_BOOST;
      const rawRate = baseRate + cyclical + randomSwing;

      if (mode === "conversion") {
        return Math.max(-0.08, Math.min(0.32, rawRate));
      }

      // crescimento anual com altos e baixos, podendo chegar a 100%
      return Math.max(-0.2, Math.min(1, rawRate));
    }

    function cumulativeGrowthFactor(targetYear: number): number {
      let factor = 1;
      if (targetYear >= BASE_YEAR) {
        for (let year = BASE_YEAR + 1; year <= targetYear; year += 1) {
          factor *= 1 + annualRateForYear(year);
        }
      } else {
        for (let year = BASE_YEAR; year > targetYear; year -= 1) {
          factor /= 1 + annualRateForYear(year);
        }
      }
      return Math.max(0.2, factor);
    }

    if (period === "daily") {
      const daysInMonth = new Date(
        selectedYear,
        selectedMonth + 1,
        0,
      ).getDate();
      const yearlyGrowthFactor = cumulativeGrowthFactor(selectedYear);
      const annualRate = annualRateForYear(selectedYear);
      let previous = profile.dailyBase * yearlyGrowthFactor * 0.9;

      const promoCenter =
        6 + Math.floor((noise(selectedYear * 13 + selectedMonth) + 1) * 5);
      const dipCenter =
        18 + Math.floor((noise(selectedYear * 19 + selectedMonth) + 1) * 4);

      return Array.from({ length: daysInMonth }, (_, idx) => {
        const day = idx + 1;
        const date = new Date(selectedYear, selectedMonth, day);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const weekendFactor = isWeekend ? 0.8 : 1;
        const paydayFactor =
          day >= 5 && day <= 8 ? 1.12 : day >= 19 && day <= 22 ? 1.08 : 1;
        const monthWeight = MONTH_SEASONALITY[selectedMonth];
        const monthlyFactor = 1 + (monthWeight - 1) * 0.9;
        const trendInsideMonth =
          1 + ((day - 1) / Math.max(1, daysInMonth - 1)) * annualRate * 0.45;
        const wave =
          1 + Math.sin((day / daysInMonth) * Math.PI * 2 - 0.6) * 0.12;
        const promoPulse =
          1 + Math.exp(-((day - promoCenter) ** 2) / 14) * 0.12;
        const dipPulse = 1 - Math.exp(-((day - dipCenter) ** 2) / 18) * 0.1;
        const randomFactor =
          1 +
          noise(selectedYear * 1000 + selectedMonth * 100 + day) *
            profile.volatility *
            1.15;

        let target =
          profile.dailyBase *
          yearlyGrowthFactor *
          weekendFactor *
          paydayFactor *
          monthlyFactor *
          trendInsideMonth *
          wave *
          promoPulse *
          dipPulse *
          randomFactor;

        if (mode === "expenses") {
          target *= 1 + (day === 5 || day === 15 || day === 28 ? 0.16 : 0);
        }

        if (mode === "conversion") {
          target =
            profile.dailyBase *
            (0.96 + (monthWeight - 1) * 0.6) *
            (1 + trendInsideMonth * 0.06) *
            (1 + noise(selectedYear * 900 + day) * 0.07);
        }

        const smoothed = previous * 0.36 + target * 0.64;
        previous = smoothed;

        return { label: String(day), value: normalizeValue(smoothed) };
      });
    }

    if (period === "monthly") {
      const yearlyGrowthFactor = cumulativeGrowthFactor(selectedYear);
      const annualRate = annualRateForYear(selectedYear);
      let previous = profile.monthlyBase * yearlyGrowthFactor * 0.86;
      const monthlyGrowthCurve = MONTH_LABELS_SHORT.map((_, monthIdx) => {
        if (monthIdx === 0) return 1;
        if (monthIdx === 11) return 2;

        const trend = 1 + monthIdx / 11;
        const irregularWave =
          1 +
          Math.sin(monthIdx * 1.35 + selectedYear * 0.09) * 0.09 +
          Math.cos(monthIdx * 0.72 + selectedYear * 0.04) * 0.06;
        const irregularNoise =
          1 + noise(selectedYear * 230 + monthIdx * 17) * 0.12;
        const raw = trend * irregularWave * irregularNoise;
        const floor = trend * 0.78;
        const ceil = trend * 1.22;

        return Math.max(floor, Math.min(ceil, raw));
      });

      return MONTH_LABELS_SHORT.map((monthLabel, idx) => {
        const monthWeight = MONTH_SEASONALITY[idx];
        const monthGrowthFactor = monthlyGrowthCurve[idx];
        const quarterWave = 1 + Math.sin((idx / 12) * Math.PI * 4 - 0.5) * 0.11;
        const monthShock =
          1 + noise(selectedYear * 200 + idx + 1) * profile.volatility * 1.2;
        const intraYearTrend = 1 + idx * annualRate * 0.05;

        let target =
          profile.monthlyBase *
          yearlyGrowthFactor *
          monthGrowthFactor *
          intraYearTrend *
          (1 + (monthWeight - 1) * profile.seasonality * 1.8) *
          quarterWave *
          monthShock;

        if (mode === "expenses") {
          target *= 1 + (idx === 0 || idx === 6 || idx === 11 ? 0.1 : 0);
        }

        if (mode === "conversion") {
          target =
            profile.monthlyBase *
            (0.98 + idx * 0.01) *
            (1 + (monthWeight - 1) * 0.65) *
            (1 + noise(selectedYear * 140 + idx + 1) * 0.06);
        }

        const smoothed = previous * 0.3 + target * 0.7;
        previous = smoothed;

        return { label: monthLabel, value: normalizeValue(smoothed) };
      });
    }

    const startYear = now.getFullYear() - 6;

    return Array.from({ length: 7 }, (_, idx) => {
      const year = startYear + idx;
      const growthMultiplier = cumulativeGrowthFactor(year);
      const annualRate = annualRateForYear(year);
      const cycle = 1 + Math.sin((idx / 6) * Math.PI * 1.7) * 0.12;
      const randomFactor =
        1 + noise(year * 17 + idx) * profile.volatility * 0.95;

      let value =
        profile.yearlyBase *
        0.82 *
        growthMultiplier *
        (1 + annualRate * 0.22) *
        cycle *
        randomFactor;

      if (mode === "conversion") {
        value =
          profile.yearlyBase *
          growthMultiplier *
          (0.92 + idx * 0.01) *
          (1 + noise(year * 11) * 0.05);
      }

      return { label: String(year), value: normalizeValue(value) };
    });
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
