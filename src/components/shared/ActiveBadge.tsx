import { cn } from "@/lib/utils";

interface ActiveBadgeProps {
  active: boolean;
  /** Sobrescreve os rótulos. Padrão: "Ativo" / "Inativo". */
  labels?: { active: string; inactive: string };
}

export function ActiveBadge({
  active,
  labels = { active: "Ativo", inactive: "Inativo" },
}: ActiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600",
      )}
    >
      {active ? labels.active : labels.inactive}
    </span>
  );
}
