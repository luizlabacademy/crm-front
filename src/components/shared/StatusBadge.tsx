import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  /** Mapa de status → classe Tailwind. Fallback para cinza. */
  colorMap?: Record<string, string>;
  /** Rótulo legível. Padrão: valor bruto do status. */
  label?: string;
}

const DEFAULT_FALLBACK = "bg-gray-100 text-gray-700";

export function StatusBadge({
  status,
  colorMap = {},
  label,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        colorMap[status] ?? DEFAULT_FALLBACK,
      )}
    >
      {label ?? status}
    </span>
  );
}
