import { describe, it, expect } from "vitest";
import { generateDailyData, generateMonthlyData, generateYearlyData } from "./syntheticData";

describe("generateDailyData", () => {
  it("gera a quantidade correta de pontos para o mês selecionado", () => {
    const data = generateDailyData("sales", 2026, 0); // janeiro
    expect(data).toHaveLength(31);
  });

  it("gera 28 pontos para fevereiro de ano não bissexto", () => {
    const data = generateDailyData("leads", 2025, 1);
    expect(data).toHaveLength(28);
  });

  it("cada ponto tem label numérico e value positivo", () => {
    const data = generateDailyData("sales", 2026, 3);
    data.forEach((point, idx) => {
      expect(point.label).toBe(String(idx + 1));
      expect(point.value).toBeGreaterThan(0);
    });
  });

  it("modo conversion gera valores entre 4 e 55", () => {
    const data = generateDailyData("conversion", 2026, 0);
    data.forEach((point) => {
      expect(point.value).toBeGreaterThanOrEqual(4);
      expect(point.value).toBeLessThanOrEqual(55);
    });
  });
});

describe("generateMonthlyData", () => {
  it("gera sempre 12 pontos", () => {
    const data = generateMonthlyData("sales", 2026);
    expect(data).toHaveLength(12);
  });

  it("labels correspondem aos meses abreviados", () => {
    const data = generateMonthlyData("leads", 2026);
    expect(data[0].label).toBe("Jan");
    expect(data[11].label).toBe("Dez");
  });

  it("todos os valores são positivos", () => {
    const data = generateMonthlyData("expenses", 2026);
    data.forEach((point) => {
      expect(point.value).toBeGreaterThan(0);
    });
  });
});

describe("generateYearlyData", () => {
  it("gera sempre 7 pontos", () => {
    const data = generateYearlyData("sales", new Date(2026, 0, 1));
    expect(data).toHaveLength(7);
  });

  it("labels são anos sequenciais", () => {
    const now = new Date(2026, 0, 1);
    const data = generateYearlyData("leads", now);
    const firstYear = Number(data[0].label);
    data.forEach((point, idx) => {
      expect(Number(point.label)).toBe(firstYear + idx);
    });
  });

  it("todos os valores são positivos", () => {
    const data = generateYearlyData("newCustomers", new Date(2026, 0, 1));
    data.forEach((point) => {
      expect(point.value).toBeGreaterThan(0);
    });
  });
});
