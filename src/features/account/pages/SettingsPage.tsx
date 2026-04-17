import { useMemo, useState } from "react";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { getStoredTheme, setTheme, type ThemeMode } from "@/lib/theme/theme";
import {
  getDefaultPageSize,
  PAGE_SIZE_OPTIONS,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";
import {
  getDefaultDashboardChartType,
  setDefaultDashboardChartType,
  type DashboardChartType,
} from "@/lib/dashboardChartTypePreference";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme());
  const [defaultPageSize, setDefaultPageSizeState] = useState<number>(() =>
    getDefaultPageSize(),
  );
  const [defaultDashboardChartType, setDefaultDashboardChartTypeState] =
    useState<DashboardChartType>(() => getDefaultDashboardChartType());

  const themeOptions = useMemo(
    () => [
      {
        value: "light" as ThemeMode,
        title: "Claro",
        description: "Interface com fundo claro",
        icon: <Sun size={16} />,
      },
      {
        value: "dark" as ThemeMode,
        title: "Escuro",
        description: "Interface com fundo escuro",
        icon: <Moon size={16} />,
      },
      {
        value: "system" as ThemeMode,
        title: "Sistema",
        description: "Segue preferencia do dispositivo",
        icon: <Laptop size={16} />,
      },
    ],
    [],
  );

  function handleThemeChange(mode: ThemeMode) {
    setTheme(mode);
    setThemeState(mode);
    toast.success("Tema atualizado com sucesso!");
  }

  function handleDefaultPageSizeChange(value: number) {
    setDefaultPageSize(value);
    setDefaultPageSizeState(value);
    toast.success("Preferência de paginação atualizada!");
  }

  function handleDefaultDashboardChartTypeChange(value: DashboardChartType) {
    setDefaultDashboardChartType(value);
    setDefaultDashboardChartTypeState(value);
    toast.success("Preferência de grafico atualizada!");
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Preferencias</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Personalize sua experiencia no CRM.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Tema</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Escolha como a interface deve aparecer para voce.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {themeOptions.map((option) => {
            const active = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleThemeChange(option.value)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent",
                )}
              >
                <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {option.icon}
                </span>
                <p className="text-sm font-medium text-foreground">
                  {option.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {option.description}
                </p>
                {active && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Check size={13} />
                    Selecionado
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Preferencias</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Defina o comportamento padrao das listagens do CRM.
        </p>

        <div className="mt-4 max-w-sm space-y-1.5">
          <label
            htmlFor="default-page-size"
            className="block text-sm font-medium text-foreground"
          >
            Quantidade padrao de registros por pagina
          </label>
          <select
            id="default-page-size"
            value={defaultPageSize}
            onChange={(event) =>
              handleDefaultPageSizeChange(Number(event.target.value))
            }
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} registros
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Essa preferencia sera usada por padrao nas telas de busca e listas.
          </p>
        </div>

        <div className="mt-5 max-w-sm space-y-1.5">
          <label
            htmlFor="default-dashboard-chart-type"
            className="block text-sm font-medium text-foreground"
          >
            Tipo padrao do grafico de desempenho
          </label>
          <select
            id="default-dashboard-chart-type"
            value={defaultDashboardChartType}
            onChange={(event) =>
              handleDefaultDashboardChartTypeChange(
                event.target.value as DashboardChartType,
              )
            }
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="area">Area</option>
            <option value="line">Linhas</option>
            <option value="bar">Barras</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Essa preferencia define o tipo inicial do grafico no dashboard.
          </p>
        </div>
      </section>
    </div>
  );
}
