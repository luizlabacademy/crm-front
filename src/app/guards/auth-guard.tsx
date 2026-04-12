import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAuthStore } from "@/lib/auth/authStore";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}