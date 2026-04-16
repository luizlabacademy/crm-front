import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface KpiCard {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: string; // tailwind text color
}

interface KpiWidgetsProps {
  cards: KpiCard[];
  loading?: boolean;
}

export function KpiWidgets({ cards, loading }: KpiWidgetsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card p-4 space-y-1"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            {card.icon}
            <span className="text-xs font-medium truncate">{card.label}</span>
          </div>
          {loading ? (
            <div className="h-6 w-20 animate-pulse rounded bg-muted" />
          ) : (
            <p className={cn("text-xl font-semibold", card.accent)}>
              {card.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
