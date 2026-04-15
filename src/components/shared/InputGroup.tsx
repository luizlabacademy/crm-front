import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function InputGroup({
  className,
  children,
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center rounded-md border border-input bg-background",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function InputGroupAddon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-3 text-sm text-muted-foreground", className)}>
      {children}
    </div>
  );
}
