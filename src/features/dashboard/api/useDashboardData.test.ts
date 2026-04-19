import { describe, it, expect } from "vitest";
import { isClosed, isPending, truncate } from "./useDashboardData";
import { ORDER_STATUS } from "@/features/dashboard/constants/orderStatus";

describe("isClosed", () => {
  it("retorna true apenas para status DELIVERED", () => {
    expect(isClosed(ORDER_STATUS.DELIVERED)).toBe(true);
  });

  it("retorna false para outros status", () => {
    expect(isClosed(ORDER_STATUS.NEW)).toBe(false);
    expect(isClosed(ORDER_STATUS.PREPARING)).toBe(false);
    expect(isClosed(ORDER_STATUS.AWAITING_PAYMENT)).toBe(false);
    expect(isClosed(ORDER_STATUS.CANCELLED)).toBe(false);
  });
});

describe("isPending", () => {
  it("retorna true para status pendentes", () => {
    expect(isPending(ORDER_STATUS.NEW)).toBe(true);
    expect(isPending(ORDER_STATUS.AWAITING_PAYMENT)).toBe(true);
    expect(isPending(ORDER_STATUS.PREPARING)).toBe(true);
    expect(isPending(ORDER_STATUS.READY_FOR_DELIVERY)).toBe(true);
  });

  it("retorna false para DELIVERED e CANCELLED", () => {
    expect(isPending(ORDER_STATUS.DELIVERED)).toBe(false);
    expect(isPending(ORDER_STATUS.CANCELLED)).toBe(false);
  });
});

describe("truncate", () => {
  it("não altera texto dentro do limite", () => {
    expect(truncate("abc", 5)).toBe("abc");
    expect(truncate("abcde", 5)).toBe("abcde");
  });

  it("trunca texto que ultrapassa o limite e adiciona reticências", () => {
    const result = truncate("texto longo demais", 8);
    expect(result).toHaveLength(9); // 8 chars + "…"
    expect(result.endsWith("…")).toBe(true);
  });

  it("não deixa espaço no final antes das reticências", () => {
    const result = truncate("texto com espaço", 10);
    expect(result).not.toMatch(/ …$/);
  });
});
