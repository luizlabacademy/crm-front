import { useMemo, useState } from "react";
import { CircleCheck, House, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import {
  getCommerceSettings,
  saveCommerceSettings,
} from "@/features/account/lib/commerceSettings";

export function DeliverySettingsPage() {
  const initial = useMemo(() => getCommerceSettings(), []);
  const [delivery, setDelivery] = useState(initial.delivery);

  const summary =
    !delivery.readyDelivery && !delivery.homeDelivery
      ? "Sem modalidades de entrega ativas"
      : delivery.readyDelivery && delivery.homeDelivery
        ? "Pronta entrega e entrega a domicílio ativas"
        : delivery.readyDelivery
          ? "Apenas pronta entrega ativa"
          : "Apenas entrega a domicílio ativa";

  function save() {
    const existing = getCommerceSettings();
    saveCommerceSettings({ ...existing, delivery });
    toast.success("Configurações de entrega salvas.");
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Entrega</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina quais tipos de entrega estarão disponíveis no checkout.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Modalidades disponíveis</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              setDelivery((prev) => ({
                ...prev,
                readyDelivery: !prev.readyDelivery,
              }))
            }
            className={`rounded-xl border p-4 text-left transition-colors ${
              delivery.readyDelivery
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-accent"
            }`}
          >
            <PackageCheck size={20} className="mb-2" />
            <p className="text-sm font-semibold">Pronta entrega</p>
            <p className="text-xs text-muted-foreground">
              Cliente retira ou recebe sem endereço detalhado.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setDelivery((prev) => ({
                ...prev,
                homeDelivery: !prev.homeDelivery,
              }))
            }
            className={`rounded-xl border p-4 text-left transition-colors ${
              delivery.homeDelivery
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-accent"
            }`}
          >
            <House size={20} className="mb-2" />
            <p className="text-sm font-semibold">Entrega a domicílio</p>
            <p className="text-xs text-muted-foreground">
              Exibe seleção de endereço e permite cadastro/edição.
            </p>
          </button>
        </div>

        {delivery.homeDelivery && (
          <div className="mt-4 max-w-xs rounded-lg border border-border/70 bg-muted/20 p-3">
            <label className="text-sm font-medium">Taxa de entrega (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={(delivery.homeDeliveryFeeCents / 100).toFixed(2)}
              onChange={(e) => {
                const parsed = Number.parseFloat(e.target.value || "0");
                const cents = Number.isNaN(parsed)
                  ? 0
                  : Math.max(0, Math.round(parsed * 100));
                setDelivery((prev) => ({
                  ...prev,
                  homeDeliveryFeeCents: cents,
                }));
              }}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800">
          <CircleCheck size={14} />
          <span className="font-medium">Resumo:</span>
          <span>{summary}</span>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Salvar configurações
        </button>
      </div>
    </div>
  );
}
