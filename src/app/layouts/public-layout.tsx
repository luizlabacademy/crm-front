import type { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-45"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="login-bg-soft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.07" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
          </linearGradient>
          <pattern
            id="login-bg-lines"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(24)"
          >
            <path
              d="M0 32H64"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="login-bg-spot" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#login-bg-lines)" />
        <path
          d="M-120 720C220 560 430 830 760 690C1030 575 1190 430 1560 520V980H-120Z"
          fill="url(#login-bg-soft)"
        />
        <circle cx="1160" cy="180" r="260" fill="url(#login-bg-spot)" />
        <circle cx="280" cy="760" r="220" fill="url(#login-bg-spot)" />
      </svg>

      <div className="pointer-events-none absolute -top-28 right-[-8rem] h-80 w-80 rounded-full bg-primary/[0.03] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-[-10rem] h-[24rem] w-[24rem] rounded-full bg-primary/[0.035] blur-3xl" />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
