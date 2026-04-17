import { useMemo, useState } from "react";
import {
  CircleAlert,
  CreditCard,
  Landmark,
  ListFilter,
  QrCode,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCommerceSettings,
  saveCommerceSettings,
  type MaxCombinedMethods,
} from "@/features/account/lib/commerceSettings";

type ConditionsTab = "gerais" | "cartao" | "boleto";

export function PaymentMethodsSettingsPage() {
  const initial = useMemo(() => getCommerceSettings(), []);
  const [payment, setPayment] = useState(initial.payment);
  const [conditionsTab, setConditionsTab] = useState<ConditionsTab>("gerais");

  const enabledCount = [
    payment.pix,
    payment.card,
    payment.cash,
    payment.boleto,
  ].filter(Boolean).length;

  function toggle(field: "pix" | "card" | "cash" | "boleto") {
    setPayment((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  function save() {
    const existing = getCommerceSettings();
    saveCommerceSettings({ ...existing, payment });
    toast.success("Formas de pagamento salvas.");
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Formas de Pagamento</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione os métodos e configure regras por tipo.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Métodos habilitados</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              key: "pix" as const,
              label: "PIX",
              icon: QrCode,
              active: payment.pix,
            },
            {
              key: "card" as const,
              label: "Cartão",
              icon: CreditCard,
              active: payment.card,
            },
            {
              key: "cash" as const,
              label: "Dinheiro",
              icon: Wallet,
              active: payment.cash,
            },
            {
              key: "boleto" as const,
              label: "Boleto",
              icon: Landmark,
              active: payment.boleto,
            },
          ].map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.key}
                type="button"
                onClick={() => toggle(method.key)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  method.active
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent"
                }`}
              >
                <Icon size={20} className="mb-2" />
                <p className="text-sm font-semibold">{method.label}</p>
                <p className="text-xs text-muted-foreground">
                  {method.active ? "Habilitado" : "Desabilitado"}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Condições de pagamento</h2>

        <div className="mt-4 flex flex-wrap items-center gap-5 border-b border-border">
          {[
            {
              key: "gerais" as const,
              label: "Regras gerais",
              icon: ListFilter,
            },
            { key: "cartao" as const, label: "Cartão", icon: CreditCard },
            { key: "boleto" as const, label: "Boleto", icon: Landmark },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setConditionsTab(tab.key)}
              className={`inline-flex items-center gap-2 border-b-2 px-0 pb-3 pt-1 text-[15px] font-medium transition-colors ${
                conditionsTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {conditionsTab === "gerais" && (
            <div className="space-y-5">
              <div className="max-w-xs">
                <label className="text-sm font-medium">
                  Combinar até quantas formas
                </label>
                <select
                  value={String(payment.maxCombinedMethods)}
                  onChange={(e) => {
                    const value =
                      e.target.value === "all" ? "all" : Number(e.target.value);
                    setPayment((prev) => ({
                      ...prev,
                      maxCombinedMethods: value as MaxCombinedMethods,
                    }));
                  }}
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="all">Todas</option>
                </select>
              </div>

              <div>
                <p className="text-sm font-semibold">% de desconto máximo</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {payment.pix && (
                    <div>
                      <label className="text-sm font-medium">PIX</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={payment.maxDiscountPercentPix}
                        onChange={(e) =>
                          setPayment((prev) => ({
                            ...prev,
                            maxDiscountPercentPix: Math.min(
                              100,
                              Math.max(
                                0,
                                Number.parseFloat(e.target.value || "0") || 0,
                              ),
                            ),
                          }))
                        }
                        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}

                  {payment.card && (
                    <div>
                      <label className="text-sm font-medium">Cartão</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={payment.maxDiscountPercentCard}
                        onChange={(e) =>
                          setPayment((prev) => ({
                            ...prev,
                            maxDiscountPercentCard: Math.min(
                              100,
                              Math.max(
                                0,
                                Number.parseFloat(e.target.value || "0") || 0,
                              ),
                            ),
                          }))
                        }
                        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}

                  {payment.cash && (
                    <div>
                      <label className="text-sm font-medium">Dinheiro</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={payment.maxDiscountPercentCash}
                        onChange={(e) =>
                          setPayment((prev) => ({
                            ...prev,
                            maxDiscountPercentCash: Math.min(
                              100,
                              Math.max(
                                0,
                                Number.parseFloat(e.target.value || "0") || 0,
                              ),
                            ),
                          }))
                        }
                        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}

                  {payment.boleto && (
                    <div>
                      <label className="text-sm font-medium">Boleto</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={payment.maxDiscountPercentBoleto}
                        onChange={(e) =>
                          setPayment((prev) => ({
                            ...prev,
                            maxDiscountPercentBoleto: Math.min(
                              100,
                              Math.max(
                                0,
                                Number.parseFloat(e.target.value || "0") || 0,
                              ),
                            ),
                          }))
                        }
                        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {conditionsTab === "cartao" &&
            (payment.card ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">
                    Mínimo por parcela (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(payment.minInstallmentAmountCents / 100).toFixed(2)}
                    onChange={(e) => {
                      const parsed = Number.parseFloat(e.target.value || "0");
                      const cents = Number.isNaN(parsed)
                        ? 0
                        : Math.max(0, Math.round(parsed * 100));
                      setPayment((prev) => ({
                        ...prev,
                        minInstallmentAmountCents: cents,
                      }));
                    }}
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Máximo de parcelas
                  </label>
                  <select
                    value={payment.maxInstallments}
                    onChange={(e) =>
                      setPayment((prev) => ({
                        ...prev,
                        maxInstallments: Number(e.target.value),
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Array.from({ length: 24 }, (_, index) => index + 1).map(
                      (value) => (
                        <option key={value} value={value}>
                          {value}x
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <CircleAlert size={16} className="mt-0.5 shrink-0" />
                <span>Ative Cartão para mostrar as opções desta aba.</span>
              </div>
            ))}

          {conditionsTab === "boleto" &&
            (payment.boleto ? (
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={payment.boletoSendByEmail}
                  onChange={(e) =>
                    setPayment((prev) => ({
                      ...prev,
                      boletoSendByEmail: e.target.checked,
                    }))
                  }
                />
                Exibir opção "Enviar boleto por e-mail"
              </label>
            ) : (
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <CircleAlert size={16} className="mt-0.5 shrink-0" />
                <span>Ative Boleto para mostrar as opções desta aba.</span>
              </div>
            ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Métodos ativos: {enabledCount}. Limite atual:{" "}
          {payment.maxCombinedMethods === "all"
            ? "todas"
            : payment.maxCombinedMethods}
          .
        </p>
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
