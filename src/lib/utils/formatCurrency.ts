const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * Converts cents to BRL currency string.
 * @example formatCurrency(150050) → "R$ 1.500,50"
 */
export function formatCurrency(cents: number): string {
  return formatter.format(cents / 100);
}

/** Hidden placeholder replacing the real value. */
export const HIDDEN_VALUE = "R$ •••••";
