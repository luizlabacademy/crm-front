import type { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="login-bg-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
          <pattern
            id="login-bg-grid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M48 0H0V48"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.07"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="login-bg-radial" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#login-bg-grid)" />
        <path
          d="M-80 620C180 480 410 760 670 620C930 480 1110 320 1520 430V980H-80Z"
          fill="url(#login-bg-gradient)"
        />
        <circle cx="1120" cy="220" r="320" fill="url(#login-bg-radial)" />
      </svg>

      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/[0.03] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/[0.04] blur-3xl" />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
