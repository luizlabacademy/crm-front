import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/auth/authStore";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().min(1, "E-mail e obrigatorio.").email("E-mail invalido."),
  password: z.string().min(1, "Senha e obrigatoria."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null);
    try {
      const { data } = await api.post<{ token: string }>("/api/v1/auth/token", {
        email: values.email,
        password: values.password,
      });

      login(data.token);

      const redirectTo = searchParams.get("redirect") ?? "/dashboard";
      void navigate(redirectTo, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setAuthError("E-mail ou senha invalidos. Verifique suas credenciais.");
          setValue("password", "");
        } else {
          toast.error("Nao foi possivel conectar ao servidor. Tente novamente.");
        }
      } else {
        toast.error("Nao foi possivel conectar ao servidor. Tente novamente.");
      }
    }
  }

  const expired = searchParams.get("expired") === "true";

  return (
    <div className="w-full max-w-sm space-y-6 px-6 py-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
        <p className="text-sm text-muted-foreground">Faca login para continuar</p>
      </div>

      {expired && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Sua sessao expirou. Faca login novamente.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            disabled={isSubmitting}
            {...register("email")}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none",
              "placeholder:text-muted-foreground",
              "focus:ring-2 focus:ring-ring focus:ring-offset-1",
              "disabled:opacity-50",
              errors.email ? "border-destructive" : "border-input"
            )}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="..."
              disabled={isSubmitting}
              {...register("password")}
              className={cn(
                "w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm outline-none",
                "placeholder:text-muted-foreground",
                "focus:ring-2 focus:ring-ring focus:ring-offset-1",
                "disabled:opacity-50",
                errors.password ? "border-destructive" : "border-input"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {authError && (
          <p className="text-sm text-destructive">{authError}</p>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium",
            "bg-primary text-primary-foreground",
            "hover:opacity-90 transition-opacity",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Entrar
        </button>
      </form>
    </div>
  );
}