import type { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex-1">{children}</main>
    </div>
  );
}
