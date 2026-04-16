const PAGE_SIZE_STORAGE_KEY = "crm:pagination:page-size";

export const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 25, 30, 50, 100] as const;
export const FALLBACK_PAGE_SIZE = 20;

function isValidPageSize(value: number): boolean {
  return PAGE_SIZE_OPTIONS.includes(
    value as (typeof PAGE_SIZE_OPTIONS)[number],
  );
}

export function getDefaultPageSize(): number {
  if (typeof window === "undefined") return FALLBACK_PAGE_SIZE;

  const raw = window.localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
  if (!raw) return FALLBACK_PAGE_SIZE;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || !isValidPageSize(parsed)) {
    return FALLBACK_PAGE_SIZE;
  }

  return parsed;
}

export function setDefaultPageSize(value: number): void {
  if (typeof window === "undefined") return;
  if (!isValidPageSize(value)) return;
  window.localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(value));
}
