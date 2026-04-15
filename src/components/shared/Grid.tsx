import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 2 | 3 | 4 | 5 | 6;
}

const colClass: Record<NonNullable<GridProps["cols"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
};

const gapClass: Record<NonNullable<GridProps["gap"]>, string> = {
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
};

export function Grid({ cols = 1, gap = 4, className, ...props }: GridProps) {
  return (
    <div
      className={cn("grid", colClass[cols], gapClass[gap], className)}
      {...props}
    />
  );
}

interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
}

const spanClass: Record<NonNullable<GridItemProps["span"]>, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  12: "col-span-12",
};

export function GridItem({ span = 1, className, ...props }: GridItemProps) {
  return <div className={cn(spanClass[span], className)} {...props} />;
}
