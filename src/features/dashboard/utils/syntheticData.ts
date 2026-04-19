import {
  type ChartMode,
  MODE_PROFILES,
  MONTH_SEASONALITY,
  MONTH_LABELS_SHORT,
} from "@/features/dashboard/constants/chartConfig";

export interface ChartPoint {
  label: string;
  value: number;
}

const BASE_YEAR = 2022;
const GROWTH_BOOST = 2;

function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function clampRate(value: number): number {
  return Math.max(4, Math.min(55, Number(value.toFixed(2))));
}

function clampSales(value: number): number {
  return Math.max(500, Math.round(value));
}

function clampCount(value: number): number {
  return Math.max(1, Math.round(value));
}

function normalizeValue(mode: ChartMode, value: number): number {
  if (mode === "conversion") return clampRate(value);
  if (mode === "sales" || mode === "expenses") return clampSales(value);
  return clampCount(value);
}

function annualRateForYear(
  mode: ChartMode,
  year: number,
): number {
  const yearIndex = year - BASE_YEAR;
  const modeSeed = mode.charCodeAt(0) + mode.length * 17;
  const profileBaseGrowth = MODE_PROFILES[mode].growth;
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

  return Math.max(-0.2, Math.min(1, rawRate));
}

function cumulativeGrowthFactor(mode: ChartMode, targetYear: number): number {
  let factor = 1;
  if (targetYear >= BASE_YEAR) {
    for (let year = BASE_YEAR + 1; year <= targetYear; year += 1) {
      factor *= 1 + annualRateForYear(mode, year);
    }
  } else {
    for (let year = BASE_YEAR; year > targetYear; year -= 1) {
      factor /= 1 + annualRateForYear(mode, year);
    }
  }
  return Math.max(0.2, factor);
}

export function generateDailyData(
  mode: ChartMode,
  selectedYear: number,
  selectedMonth: number,
): ChartPoint[] {
  const profile = MODE_PROFILES[mode];
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const yearlyGrowthFactor = cumulativeGrowthFactor(mode, selectedYear);
  const annualRate = annualRateForYear(mode, selectedYear);
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
    const wave = 1 + Math.sin((day / daysInMonth) * Math.PI * 2 - 0.6) * 0.12;
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

    return { label: String(day), value: normalizeValue(mode, smoothed) };
  });
}

export function generateMonthlyData(
  mode: ChartMode,
  selectedYear: number,
): ChartPoint[] {
  const profile = MODE_PROFILES[mode];
  const yearlyGrowthFactor = cumulativeGrowthFactor(mode, selectedYear);
  const annualRate = annualRateForYear(mode, selectedYear);
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

    return { label: monthLabel, value: normalizeValue(mode, smoothed) };
  });
}

export function generateYearlyData(mode: ChartMode, now: Date): ChartPoint[] {
  const profile = MODE_PROFILES[mode];
  const startYear = now.getFullYear() - 6;

  return Array.from({ length: 7 }, (_, idx) => {
    const year = startYear + idx;
    const growthMultiplier = cumulativeGrowthFactor(mode, year);
    const annualRate = annualRateForYear(mode, year);
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

    return { label: String(year), value: normalizeValue(mode, value) };
  });
}
