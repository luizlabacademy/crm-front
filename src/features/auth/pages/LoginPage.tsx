import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
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
          setAuthError(
            "E-mail ou senha invalidos. Verifique suas credenciais.",
          );
          setValue("password", "");
        } else {
          toast.error(
            "Nao foi possivel conectar ao servidor. Tente novamente.",
          );
        }
      } else {
        toast.error("Nao foi possivel conectar ao servidor. Tente novamente.");
      }
    }
  }

  const expired = searchParams.get("expired") === "true";

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <span className="text-lg font-bold tracking-tight">C</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o CRM
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm shadow-black/[0.03]">
          {expired && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>Sua sessao expirou. Faca login novamente.</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                E-mail
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                  {...register("email")}
                  className={cn(
                    "h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition-all duration-150",
                    "placeholder:text-muted-foreground/50",
                    "focus:border-primary/40 focus:ring-2 focus:ring-ring/20",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    errors.email ? "border-destructive" : "border-input",
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  disabled={isSubmitting}
                  {...register("password")}
                  className={cn(
                    "h-10 w-full rounded-lg border bg-background pl-9 pr-10 text-sm outline-none transition-all duration-150",
                    "placeholder:text-muted-foreground/50",
                    "focus:border-primary/40 focus:ring-2 focus:ring-ring/20",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    errors.password ? "border-destructive" : "border-input",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground/60 transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Auth error */}
            {authError && (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={cn(
                "flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium",
                "bg-primary text-primary-foreground",
                "transition-all duration-150",
                "hover:opacity-90 active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
              )}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Entrar
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/60">
          Acesso restrito a usuarios autorizados
        </p>
      </div>
    </div>
  );
}
