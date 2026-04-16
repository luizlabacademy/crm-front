import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaChart,
  Area,
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
import type { ConversionPeriod } from "@/features/dashboard/types/dashboardTypes";

// ─── Period selector ─────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { value: ConversionPeriod; label: string }[] = [
  { value: "daily", label: "Diária" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
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
  { value: "sales", label: "Desempenho de Vendas" },
  { value: "expenses", label: "Despesas" },
  { value: "leads", label: "Leads" },
  { value: "conversion", label: "Curva de Conversão" },
  { value: "newCustomers", label: "Novos Clientes" },
  { value: "activeCustomers", label: "Clientes Ativos" },
  { value: "servicesCompleted", label: "Atendimentos Realizados" },
];

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
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [period, setPeriod] = useState<ConversionPeriod>("monthly");
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

  const rawData = useMemo<ChartPoint[]>(() => {
    if (period === "daily") {
      const daysInMonth = new Date(
        selectedYear,
        selectedMonth + 1,
        0,
      ).getDate();
      return Array.from({ length: daysInMonth }, (_, idx) => {
        const day = idx + 1;
        const seed =
          (selectedYear * 37 + (selectedMonth + 1) * 19 + day * 13) % 31;
        const wave = Math.sin(day / 3.2);
        const value =
          mode === "conversion"
            ? clampRate(16 + seed * 0.7 + wave * 4)
            : mode === "sales"
              ? clampSales(9000 + seed * 780 + wave * 1800)
              : mode === "expenses"
                ? clampSales(3800 + seed * 420 + wave * 1000)
                : mode === "leads"
                  ? clampCount(32 + seed * 1.3 + wave * 2.8)
                  : mode === "newCustomers"
                    ? clampCount(14 + seed * 0.9 + wave * 2)
                    : mode === "activeCustomers"
                      ? clampCount(70 + seed * 1.2 + wave * 3)
                      : clampCount(55 + seed * 1.5 + wave * 3.2);
        return { label: String(day), value };
      });
    }

    if (period === "monthly") {
      return MONTH_LABELS_SHORT.map((monthLabel, idx) => {
        const seed = (selectedYear * 11 + (idx + 1) * 17) % 23;
        const wave = Math.cos((idx + 1) / 2.2);
        const value =
          mode === "conversion"
            ? clampRate(17 + seed * 0.75 + wave * 2.8)
            : mode === "sales"
              ? clampSales(240000 + seed * 18000 + wave * 28000)
              : mode === "expenses"
                ? clampSales(110000 + seed * 9000 + wave * 14000)
                : mode === "leads"
                  ? clampCount(820 + seed * 20 + wave * 36)
                  : mode === "newCustomers"
                    ? clampCount(280 + seed * 8 + wave * 18)
                    : mode === "activeCustomers"
                      ? clampCount(1400 + seed * 16 + wave * 30)
                      : clampCount(1200 + seed * 18 + wave * 34);
        return { label: monthLabel, value };
      });
    }

    return Array.from({ length: 7 }, (_, idx) => {
      const year = now.getFullYear() - (6 - idx);
      const seed = (year * 9 + (idx + 1) * 7) % 24;
      const wave = Math.sin(idx * 0.9);
      const value =
        mode === "conversion"
          ? clampRate(15 + seed * 0.7 + wave * 2.6)
          : mode === "sales"
            ? clampSales(2800000 + seed * 150000 + wave * 220000)
            : mode === "expenses"
              ? clampSales(1280000 + seed * 80000 + wave * 120000)
              : mode === "leads"
                ? clampCount(9800 + seed * 380 + wave * 620)
                : mode === "newCustomers"
                  ? clampCount(3600 + seed * 180 + wave * 320)
                  : mode === "activeCustomers"
                    ? clampCount(14500 + seed * 320 + wave * 500)
                    : clampCount(12800 + seed * 340 + wave * 520);
      return { label: String(year), value };
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

  return (
    <div className="h-full rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between gap-2">
        <div ref={modeMenuRef} className="relative inline-flex items-center">
          <button
            type="button"
            onClick={() => setModeMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 bg-transparent py-0 text-sm font-semibold text-foreground"
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
        <div
          className={mode === "expenses" ? "invisible pointer-events-none" : ""}
        >
          <CampaignFilterDropdown
            options={CAMPAIGN_OPTIONS}
            selectedIds={selectedCampaigns}
            onChange={setSelectedCampaigns}
          />
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
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
                      : "text-muted-foreground hover:text-foreground",
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

              <span className="min-w-28 text-center text-sm font-medium text-foreground">
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
          <AreaChart
            data={filteredData}
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
        </ResponsiveContainer>
      </div>
    </div>
  );
}
