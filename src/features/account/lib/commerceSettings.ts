import mockSettingsFile from "@/mocks/GET-settings--commerce.json";

const STORAGE_KEY = "crm:commerce-settings:v1";

export type MaxCombinedMethods = number | "all";

export interface PaymentPreferences {
  pix: boolean;
  card: boolean;
  cash: boolean;
  boleto: boolean;
  boletoSendByEmail: boolean;
  maxDiscountPercentPix: number;
  maxDiscountPercentCard: number;
  maxDiscountPercentCash: number;
  maxDiscountPercentBoleto: number;
  minInstallmentAmountCents: number;
  maxInstallments: number;
  maxCombinedMethods: MaxCombinedMethods;
}

export interface DeliveryPreferences {
  readyDelivery: boolean;
  homeDelivery: boolean;
  homeDeliveryFeeCents: number;
}

export interface CommerceSettings {
  payment: PaymentPreferences;
  delivery: DeliveryPreferences;
}

function sanitize(input: unknown): CommerceSettings {
  const fallback = mockSettingsFile.responseBody as CommerceSettings;
  if (!input || typeof input !== "object") return fallback;
  const parsed = input as Partial<CommerceSettings>;

  return {
    payment: {
      pix: parsed.payment?.pix ?? fallback.payment.pix,
      card: parsed.payment?.card ?? fallback.payment.card,
      cash: parsed.payment?.cash ?? fallback.payment.cash,
      boleto: parsed.payment?.boleto ?? fallback.payment.boleto,
      boletoSendByEmail:
        parsed.payment?.boletoSendByEmail ?? fallback.payment.boletoSendByEmail,
      maxDiscountPercentPix:
        parsed.payment?.maxDiscountPercentPix ??
        fallback.payment.maxDiscountPercentPix,
      maxDiscountPercentCard:
        parsed.payment?.maxDiscountPercentCard ??
        fallback.payment.maxDiscountPercentCard,
      maxDiscountPercentCash:
        parsed.payment?.maxDiscountPercentCash ??
        fallback.payment.maxDiscountPercentCash,
      maxDiscountPercentBoleto:
        parsed.payment?.maxDiscountPercentBoleto ??
        fallback.payment.maxDiscountPercentBoleto,
      minInstallmentAmountCents:
        parsed.payment?.minInstallmentAmountCents ??
        fallback.payment.minInstallmentAmountCents,
      maxInstallments:
        parsed.payment?.maxInstallments ?? fallback.payment.maxInstallments,
      maxCombinedMethods:
        parsed.payment?.maxCombinedMethods ??
        fallback.payment.maxCombinedMethods,
    },
    delivery: {
      readyDelivery:
        parsed.delivery?.readyDelivery ?? fallback.delivery.readyDelivery,
      homeDelivery:
        parsed.delivery?.homeDelivery ?? fallback.delivery.homeDelivery,
      homeDeliveryFeeCents:
        parsed.delivery?.homeDeliveryFeeCents ??
        fallback.delivery.homeDeliveryFeeCents,
    },
  };
}

export function getCommerceSettings(): CommerceSettings {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return sanitize(mockSettingsFile.responseBody);
  try {
    return sanitize(JSON.parse(raw));
  } catch {
    return sanitize(mockSettingsFile.responseBody);
  }
}

export function saveCommerceSettings(next: CommerceSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
