import { useState } from "react";
import {
  PriceTableModal,
  UpgradeNeededModal,
} from "@/features/billing/components/UpgradeModals";

type PlanCategory = "autonomo" | "empresarial";
type TierId = "basic" | "plus" | "pro";
type Tier = {
  id: TierId;
  name: string;
  basePrice: number;
  subtitle: string;
  features: string[];
};

const BUSINESS_MULTIPLIER = 1.5;

const TIERS: Tier[] = [
  {
    id: "basic",
    name: "Go",
    basePrice: 0,
    subtitle: "Plano Free",
    features: [
      "CRM",
      "WhatsApp marketing (limitado)",
      "E-mail marketing (limitado)",
      "Automação de marketing (básica)",
      "Campanhas de marketing (desativadas)",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    basePrice: 39,
    subtitle: "Profissional Autônomo",
    features: ["CRM completo", "WhatsApp marketing", "E-mail marketing", "Automação de marketing", "Campanhas de marketing"],
  },
  {
    id: "pro",
    name: "Pro",
    basePrice: 129,
    subtitle: "Empresarial",
    features: ["Tudo do Plus", "Usuários e permissões", "Integrações avançadas", "Relatórios e histórico"],
  },
];

function formatPlanPrice(price: number) {
  const minimumFractionDigits = Number.isInteger(price) ? 0 : 2;
  return price.toLocaleString("pt-BR", { minimumFractionDigits, maximumFractionDigits: 2 });
}

function getTierPrice(tierId: TierId, basePrice: number, category: PlanCategory) {
  if (tierId === "basic") return basePrice;
  return category === "empresarial" ? basePrice * BUSINESS_MULTIPLIER : basePrice;
}

function getTierFeatures(tierId: TierId, baseFeatures: string[], category: PlanCategory) {
  if (tierId === "plus") {
    return [...baseFeatures, "Backups automáticos", "Suporte via e-mail"];
  }

  if (tierId === "pro") {
    const proFeatures = [...baseFeatures, "Suporte via chat em horário comercial"];

    if (category === "empresarial") {
      proFeatures.push("SLA de 30 minutos para retorno do suporte", "+ R$ 49,90 por filial");
    }

    return proFeatures;
  }

  return baseFeatures;
}

export function PlanPage() {
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory>("autonomo");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [priceTableOpen, setPriceTableOpen] = useState(false);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Faça upgrade do seu plano</h1>
        <p className="mt-2 text-sm text-muted-foreground">Escolha o plano ideal para o seu negócio</p>

        <div className="mx-auto mt-6 inline-flex items-center rounded-full bg-muted p-1 shadow-sm">
          <button
            onClick={() => setSelectedCategory("autonomo")}
            className={`px-5 py-2 rounded-full text-sm font-medium ${selectedCategory === "autonomo" ? "bg-white shadow" : "text-muted-foreground"}`}
          >
            Profissional Autônomo
          </button>
          <button
            onClick={() => setSelectedCategory("empresarial")}
            className={`px-5 py-2 rounded-full text-sm font-medium ${selectedCategory === "empresarial" ? "bg-white shadow" : "text-muted-foreground"}`}
          >
            Empresarial
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const highlighted = tier.id === "pro";
          const tierPrice = getTierPrice(tier.id, tier.basePrice, selectedCategory);
          const tierFeatures = getTierFeatures(tier.id, tier.features, selectedCategory);
          const tierSubtitle =
            tier.id === "basic"
              ? tier.subtitle
              : selectedCategory === "empresarial"
                ? "Empresarial"
                : "Profissional Autônomo";

          return (
            <div
              key={tier.id}
              className={`rounded-2xl overflow-hidden ${highlighted ? "border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-xl" : "border bg-white"}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tierSubtitle}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">R$</div>
                    <div className="text-4xl font-extrabold">{formatPlanPrice(tierPrice)}</div>
                    <div className="text-xs text-muted-foreground">/ mês</div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-700">{tier.id === "basic" ? "Comece gratuitamente e cresça conforme precisa." : "Desbloqueie recursos avançados para escalar seu negócio."}</p>

                <div className="mt-6 space-y-2">
                  {tierFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <div className="mt-1 h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-[11px]">✓</div>
                      <div className="text-sm text-foreground">{f}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                {tier.id === "basic" ? (
                    <button className="w-full rounded-full border px-4 py-2 text-sm">Seu plano atual</button>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button onClick={() => setPriceTableOpen(true)} className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold ${highlighted ? "bg-indigo-600 text-white" : "bg-primary text-white"}`}>Fazer upgrade</button>
                    </div>
                  )}
              </div>
            </div>

              {highlighted && (
                <div className="border-t bg-indigo-25 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Tudo do Plus, incluindo:</div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-2 py-1 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-white text-muted-foreground">5x</span>
                      <span className="text-muted-foreground">20x</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <UpgradeNeededModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onViewPlans={() => {
          setUpgradeModalOpen(false);
          setPriceTableOpen(true);
        }}
      />

      <PriceTableModal open={priceTableOpen} onClose={() => setPriceTableOpen(false)} />
    </div>
  );
}

export default null as any;
