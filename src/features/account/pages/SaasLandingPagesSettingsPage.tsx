import { useState } from "react";
import { ExternalLink, Eye, Scissors, ShoppingBag, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "crm_saas_landing_pages";

interface SaasLandingConfig {
  salon: boolean;
  foodDelivery: boolean;
}

function getConfig(): SaasLandingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SaasLandingConfig;
  } catch {
    // ignore
  }
  return { salon: false, foodDelivery: false };
}

function saveConfig(config: SaasLandingConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SaasLandingPagesSettingsPage() {
  const [config, setConfig] = useState<SaasLandingConfig>(() => getConfig());

  function toggle(key: keyof SaasLandingConfig) {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    saveConfig(updated);
    const label = key === "salon" ? "Salão de Beleza" : "Comida Delivery";
    toast.success(
      updated[key]
        ? `Landing page "${label}" ativada.`
        : `Landing page "${label}" desativada.`,
    );
  }

  const pages = [
    {
      key: "salon" as const,
      label: "Salão de Beleza",
      description:
        "Landing page voltada para captar clientes de salões de beleza e barbearias. Apresenta agendamento via WhatsApp Bot e CRM especializado.",
      icon: <Scissors className="w-5 h-5" />,
      color: "rose",
      path: "/saas/landing/salon",
    },
    {
      key: "foodDelivery" as const,
      label: "Comida Delivery",
      description:
        "Landing page voltada para restaurantes e negócios de delivery. Apresenta gestão de pedidos, atendimento automático e fidelização via WhatsApp.",
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "orange",
      path: "/saas/landing/food-delivery",
      comingSoon: true,
    },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Landing Pages SaaS</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Ative e gerencie as páginas de venda de licenças para cada segmento.
        </p>
      </div>

      {/* Cards */}
      {pages.map((page) => {
        const active = config[page.key];
        const isRose = page.color === "rose";

        return (
          <section
            key={page.key}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                    isRose
                      ? "bg-rose-500/10 text-rose-500"
                      : "bg-orange-500/10 text-orange-500",
                  )}
                >
                  {page.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h2 className="text-base font-semibold">{page.label}</h2>
                    {"comingSoon" in page && page.comingSoon && (
                      <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        Em breve
                      </span>
                    )}
                    {active && (
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          isRose
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                        )}
                      >
                        Ativa
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {page.description}
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => {
                  if ("comingSoon" in page && page.comingSoon) {
                    toast.info("Esta landing page estará disponível em breve.");
                    return;
                  }
                  toggle(page.key);
                }}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  "comingSoon" in page && page.comingSoon
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer",
                  active
                    ? isRose
                      ? "text-rose-500"
                      : "text-orange-500"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title={active ? "Desativar" : "Ativar"}
              >
                {active ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            {/* URL + actions — shown when active */}
            {active && (
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                  Link da página
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* URL display */}
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground select-none">
                      {window.location.origin}
                    </span>
                    <span className="text-xs font-mono text-foreground font-semibold truncate">
                      {page.path}
                    </span>
                  </div>

                  {/* Copy */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}${page.path}`;
                      navigator.clipboard.writeText(url).then(() => {
                        toast.success("Link copiado!");
                      });
                    }}
                    className="text-xs font-medium px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors whitespace-nowrap"
                  >
                    Copiar link
                  </button>

                  {/* Visualize */}
                  <a
                    href={page.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap",
                      isRose
                        ? "bg-rose-500 hover:bg-rose-400 text-white"
                        : "bg-orange-500 hover:bg-orange-400 text-white",
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Visualizar
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </section>
        );
      })}

      {/* Info box */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold mb-1">Como funciona</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ao ativar uma landing page, ela fica disponível publicamente no link
          indicado. Qualquer pessoa com o link pode acessar e entrar em contato
          para adquirir uma licença. Você pode desativar a qualquer momento para
          parar de receber novos leads por aquele segmento.
        </p>
      </section>
    </div>
  );
}
