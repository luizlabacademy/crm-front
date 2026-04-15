import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  id: string;
  title: string;
  subtitle?: string;
  content: ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItemData[];
  className?: string;
  defaultOpenId?: string | null;
}

export function Accordion({
  items,
  className,
  defaultOpenId = null,
}: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={cn(
              "rounded-md border border-border bg-muted/20 overflow-hidden",
              item.disabled && "opacity-60",
            )}
          >
            <button
              type="button"
              disabled={item.disabled}
              onClick={() =>
                setOpenId((current) => (current === item.id ? null : item.id))
              }
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-accent/30 transition-colors"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium truncate">
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="block text-xs text-muted-foreground truncate">
                    {item.subtitle}
                  </span>
                )}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  "shrink-0 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen && (
              <div className="border-t border-border p-3">{item.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
