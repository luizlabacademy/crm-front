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
          <linearGradient id="login-bg-soft-shape" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.06" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.014" />
          </linearGradient>
          <radialGradient id="login-bg-bloom-top" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="login-bg-bloom-bottom" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <pattern
            id="login-bg-dots"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M20 2A1.2 1.2 0 1 0 20 4.4A1.2 1.2 0 1 0 20 2"
              fill="currentColor"
              fillOpacity="0.04"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#login-bg-dots)" />

        <path
          d="M-140 740C130 540 390 810 700 690C980 580 1190 420 1560 520V980H-140Z"
          fill="url(#login-bg-soft-shape)"
        />
        <path
          d="M760 -120C980 -130 1240 -20 1500 180C1330 240 1160 320 960 300C810 286 700 240 640 170C610 136 640 -110 760 -120Z"
          fill="url(#login-bg-soft-shape)"
        />

        <ellipse
          cx="1120"
          cy="150"
          rx="280"
          ry="180"
          fill="url(#login-bg-bloom-top)"
        />
        <ellipse
          cx="240"
          cy="780"
          rx="240"
          ry="170"
          fill="url(#login-bg-bloom-bottom)"
        />

        <path
          d="M-100 250C150 130 430 340 730 250C970 180 1160 60 1520 160"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="1.15"
        />
        <path
          d="M-120 310C140 200 420 410 730 320C980 250 1180 130 1540 230"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.06"
          strokeWidth="1.05"
        />

        <path
          d="M930 540C1010 500 1100 500 1170 545C1230 584 1280 654 1350 670"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.07"
          strokeWidth="1"
        />

        <polygon
          points="260,520 360,490 440,560 330,600"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.06"
          strokeWidth="1"
        />
        <polygon
          points="1010,330 1100,300 1170,360 1070,400"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.055"
          strokeWidth="1"
        />
      </svg>

      <div className="pointer-events-none absolute -top-24 right-[-7rem] h-72 w-72 rounded-full bg-primary/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-[-8rem] h-80 w-80 rounded-full bg-primary/[0.035] blur-3xl" />
      <div className="pointer-events-none absolute left-[50%] top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/[0.015] blur-3xl" />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
