import { create } from "zustand";

interface JwtPayload {
  sub?: string;
  exp?: number;
  [key: string]: unknown;
}

function decodeJwt(token: string): JwtPayload {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return {};
  }
}

function isTokenExpired(token: string): boolean {
  const { exp } = decodeJwt(token);
  if (!exp) return false;
  return Date.now() >= exp * 1000;
}

interface AuthState {
  token: string | null;
  _expiryTimerId: ReturnType<typeof setTimeout> | null;
  login: (token: string) => void;
  logout: () => void;
}

const STORAGE_KEY = "crm_token";

export const useAuthStore = create<AuthState>((set, get) => ({
  token: (() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && !isTokenExpired(stored)) return stored;
    if (stored) localStorage.removeItem(STORAGE_KEY);
    return null;
  })(),

  _expiryTimerId: null,

  login(token) {
    const prev = get()._expiryTimerId;
    if (prev !== null) clearTimeout(prev);

    localStorage.setItem(STORAGE_KEY, token);

    const { exp } = decodeJwt(token);
    let timerId: ReturnType<typeof setTimeout> | null = null;

    if (exp) {
      const warningDelay = exp * 1000 - Date.now() - 60_000;
      if (warningDelay > 0) {
        timerId = setTimeout(() => {
          import("sonner").then(({ toast }) => {
            toast.warning("Sua sessao expira em breve. Salve seu trabalho e faca login novamente.");
          });
        }, warningDelay);
      }

      const logoutDelay = exp * 1000 - Date.now();
      if (logoutDelay > 0) {
        setTimeout(() => {
          get().logout();
          window.location.href = "/login?expired=true";
        }, logoutDelay);
      }
    }

    set({ token, _expiryTimerId: timerId });
  },

  logout() {
    const { _expiryTimerId } = get();
    if (_expiryTimerId !== null) clearTimeout(_expiryTimerId);
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, _expiryTimerId: null });
  },
}));