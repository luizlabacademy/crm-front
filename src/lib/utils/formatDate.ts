import { formatDistanceToNow, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Returns a relative time string in pt-BR.
 * @example formatRelative("2024-01-15T10:30:00Z") → "há 5 minutos"
 */
export function formatRelative(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch {
    return dateString;
  }
}

/**
 * Returns a short date string in pt-BR format dd/MM/yyyy.
 * @example formatShortDate("2024-01-15T10:30:00Z") → "15/01/2024"
 */
export function formatShortDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "dd/MM/yyyy");
  } catch {
    return dateString;
  }
}

/**
 * Returns a full datetime string in pt-BR format.
 * @example formatDateTime("2024-01-15T10:30:00Z") → "15/01/2024 10:30"
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "dd/MM/yyyy HH:mm");
  } catch {
    return dateString;
  }
}
