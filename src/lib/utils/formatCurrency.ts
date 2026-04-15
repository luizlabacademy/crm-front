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

/**
 * Converts cents to a currency string using the given currency code.
 * Falls back to BRL if no code is provided.
 * @example formatCurrencyCode(150050, "USD") → "US$ 1.500,50"
 */
export function formatCurrencyCode(
  cents: number,
  currencyCode = "BRL",
): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: currencyCode,
  });
}

/** Hidden placeholder replacing the real value. */
export const HIDDEN_VALUE = "R$ •••••";
