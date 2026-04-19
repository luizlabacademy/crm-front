import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth/authStore";

const baseURL = import.meta.env.VITE_API_BASE_URL;
if (import.meta.env.DEV && !baseURL) {
  throw new Error(
    "[crm-front] VITE_API_BASE_URL não está definido. Verifique o arquivo .env.",
  );
}

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject the JWT token into every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401, 403, and 5xx globally
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401) {
        useAuthStore.getState().logout();
        const redirect = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?redirect=${redirect}&expired=true`;
      }

      if (status === 403) {
        toast.error("Voce nao tem permissao para acessar este recurso.");
      }

      if (status !== undefined && status >= 500) {
        toast.error("Erro no servidor. Tente novamente em instantes.");
      }
    }

    return Promise.reject(error);
  }
);