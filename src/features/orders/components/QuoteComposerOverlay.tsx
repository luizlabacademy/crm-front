import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  ChevronDown,
  CreditCard,
  MapPin,
  Maximize2,
  Minimize2,
  Package,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  X,
  Minus,
  Sparkles,
  Copy,
} from "lucide-react";
import { formatCurrencyCode } from "@/lib/utils/formatCurrency";
import type { CatalogItemResponse } from "@/features/orders/types/orderTypes";
import { getCommerceSettings } from "@/features/account/lib/commerceSettings";

interface CustomerOption {
  id: number;
  name: string;
}

interface CartLine {
  itemId: number;
  quantity: number;
  unitPriceCents: number;
}

type PaymentMethod = "pix" | "cartao" | "boleto" | "dinheiro";

interface PaymentSplit {
  method: PaymentMethod;
  amountCents: number;
}

interface DeliveryAddress {
  id: number;
  label: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface QuoteFinalizePayload {
  customerId: number;
  customerName: string;
  lines: CartLine[];
  discountCents: number;
  subtotalCents: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  paymentMethods: PaymentSplit[];
  cardBrand: string | null;
  installments: number | null;
  pixKey: string | null;
  deliveryAddressId: number | null;
  deliveryAddress: string | null;
}

interface QuoteComposerOverlayProps {
  open: boolean;
  onClose: () => void;
  catalogItems: CatalogItemResponse[];
  customers: CustomerOption[];
  isCatalogLoading?: boolean;
  currencyCode?: string;
  initialCustomerId?: number | null;
  title?: string;
  onFinalize: (payload: QuoteFinalizePayload) => void;
}

export function QuoteComposerOverlay({
  open,
  onClose,
  catalogItems,
  customers,
  isCatalogLoading = false,
  currencyCode = "BRL",
  initialCustomerId,
  title = "Novo Orçamento",
  onFinalize,
}: QuoteComposerOverlayProps) {
  const commerceSettings = useMemo(() => getCommerceSettings(), [open]);
  const availablePaymentMethods: PaymentMethod[] = useMemo(() => {
    const list: PaymentMethod[] = [];
    if (commerceSettings.payment.pix) list.push("pix");
    if (commerceSettings.payment.card) list.push("cartao");
    if (commerceSettings.payment.cash) list.push("dinheiro");
    if (commerceSettings.payment.boleto) list.push("boleto");
    return list.length > 0 ? list : ["pix"];
  }, [commerceSettings]);
  const canReadyDelivery = commerceSettings.delivery.readyDelivery;
  const canHomeDelivery = commerceSettings.delivery.homeDelivery;

  const [searchItem, setSearchItem] = useState("");
  const [activeCatalogIndex, setActiveCatalogIndex] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [totalCents, setTotalCents] = useState(0);
  const [pendingScrollItemId, setPendingScrollItemId] = useState<number | null>(
    null,
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const deliveryReadyButtonRef = useRef<HTMLButtonElement>(null);
  const deliveryHomeButtonRef = useRef<HTMLButtonElement>(null);
  const addAddressButtonRef = useRef<HTMLButtonElement>(null);
  const wizardConfirmButtonRef = useRef<HTMLButtonElement>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    initialCustomerId ?? null,
  );
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [activeCustomerIndex, setActiveCustomerIndex] = useState(0);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    "pix",
  ]);
  const [paymentAmounts, setPaymentAmounts] = useState<
    Record<PaymentMethod, number>
  >({
    pix: 0,
    cartao: 0,
    boleto: 0,
    dinheiro: 0,
  });
  const [cardBrand, setCardBrand] = useState("visa");
  const [installments, setInstallments] = useState(1);
  const [pixKey] = useState(
    "00020126580014BR.GOV.BCB.PIX0136chave-pix-salao@empresa.com",
  );
  const [addressesByCustomer, setAddressesByCustomer] = useState<
    Record<number, DeliveryAddress[]>
  >({});
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [deliveryType, setDeliveryType] = useState<"ready" | "home">("ready");
  const [addressDraft, setAddressDraft] = useState<DeliveryAddress>({
    id: 0,
    label: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement),
  );
  const [keepFullscreen, setKeepFullscreen] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [fullscreenPromptChoice, setFullscreenPromptChoice] = useState<
    "sim" | "nao"
  >("sim");

  useEffect(() => {
    if (!open) return;
    setSearchItem("");
    setCart([]);
    setDiscountPercent(0);
    setTotalCents(0);
    setPendingScrollItemId(null);
    setSelectedCustomerId(initialCustomerId ?? customers[0]?.id ?? null);
    setShowCustomerSearch(false);
    setCustomerQuery("");
    setActiveCustomerIndex(0);
    setShowClearConfirm(false);
    setShowWizard(false);
    setShowFullscreenPrompt(true);
    setFullscreenPromptChoice("sim");
    setWizardStep(1);
    setPaymentMethods([availablePaymentMethods[0] ?? "pix"]);
    setPaymentAmounts({ pix: 0, cartao: 0, boleto: 0, dinheiro: 0 });
    setCardBrand("visa");
    setInstallments(1);
    setSelectedAddressId(null);
    setShowAddressModal(false);
    setEditingAddressId(null);
    setDeliveryType(
      canReadyDelivery ? "ready" : canHomeDelivery ? "home" : "ready",
    );
    setAddressDraft({
      id: 0,
      label: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    });
  }, [
    availablePaymentMethods,
    canHomeDelivery,
    canReadyDelivery,
    customers,
    initialCustomerId,
    open,
  ]);

  useEffect(() => {
    if (!open) return;
    if (selectedCustomerId != null) return;
    if (customers.length === 0) return;
    setSelectedCustomerId(customers[0].id);
  }, [customers, open, selectedCustomerId]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || showCustomerSearch || showWizard || showFullscreenPrompt)
      return;
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, [open, showCustomerSearch, showWizard, showFullscreenPrompt]);

  useEffect(() => {
    if (open) return;
    setKeepFullscreen(false);
    if (!document.fullscreenElement) return;
    void document.exitFullscreen().catch(() => undefined);
  }, [open]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      if (open && keepFullscreen && !document.fullscreenElement) {
        void document.documentElement
          .requestFullscreen()
          .catch(() => undefined);
      }
      if (open && !showCustomerSearch && !showWizard && !showFullscreenPrompt) {
        focusSearchInput();
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [
    keepFullscreen,
    open,
    showCustomerSearch,
    showFullscreenPrompt,
    showWizard,
  ]);

  const selectedCustomer = useMemo(
    () =>
      customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const filteredCustomers = useMemo(() => {
    const query = customerQuery.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(query),
    );
  }, [customerQuery, customers]);

  const filteredCatalogItems = useMemo(() => {
    const query = searchItem.trim().toLowerCase();
    if (!query) return catalogItems;
    return catalogItems.filter((item) =>
      item.name.toLowerCase().includes(query),
    );
  }, [catalogItems, searchItem]);

  const catalogById = useMemo(
    () => new Map(catalogItems.map((item) => [item.id, item])),
    [catalogItems],
  );

  const cartQty = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotalCents = cart.reduce(
    (sum, line) => sum + line.quantity * line.unitPriceCents,
    0,
  );
  const discountCents = Math.max(0, subtotalCents - totalCents);
  const activeAddresses =
    selectedCustomerId != null
      ? (addressesByCustomer[selectedCustomerId] ?? [])
      : [];
  const selectedAddress =
    activeAddresses.find((address) => address.id === selectedAddressId) ?? null;
  const paymentAllocatedCents = paymentMethods.reduce(
    (sum, method) => sum + (paymentAmounts[method] ?? 0),
    0,
  );
  const paymentRemainingCents = totalCents - paymentAllocatedCents;

  function buildDefaultAddresses(customer: CustomerOption): DeliveryAddress[] {
    return [
      {
        id: 1,
        label: "Casa",
        street: `Rua ${customer.name.split(" ")[0] || "Principal"}`,
        number: "120",
        complement: "",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01000-000",
      },
      {
        id: 2,
        label: "Trabalho",
        street: "Avenida Paulista",
        number: "900",
        complement: "Sala 42",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100",
      },
    ];
  }

  function formatAddress(address: DeliveryAddress) {
    const complement = address.complement.trim();
    return `${address.street}, ${address.number}${complement ? ` - ${complement}` : ""}, ${address.neighborhood}, ${address.city} - ${address.state}, CEP ${address.zipCode}`;
  }

  function openAddressModal(address?: DeliveryAddress) {
    if (address) {
      setEditingAddressId(address.id);
      setAddressDraft(address);
    } else {
      setEditingAddressId(null);
      setAddressDraft({
        id: 0,
        label: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      });
    }
    setShowAddressModal(true);
  }

  function updatePaymentAmount(method: PaymentMethod, value: string) {
    const parsed = Number.parseFloat(value || "0");
    const next = Number.isNaN(parsed)
      ? 0
      : Math.max(0, Math.round(parsed * 100));
    setPaymentAmounts((prev) => ({ ...prev, [method]: next }));
  }

  function togglePaymentMethod(method: PaymentMethod) {
    if (!availablePaymentMethods.includes(method)) return;
    setPaymentMethods((prev) => {
      if (prev.includes(method)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== method);
      }
      if (commerceSettings.payment.maxCombinedMethods !== "all") {
        const limit = commerceSettings.payment.maxCombinedMethods;
        if (prev.length >= limit) return prev;
      }
      return [...prev, method];
    });
  }

  async function copyPixKey() {
    try {
      await navigator.clipboard.writeText(pixKey);
    } catch {
      // noop
    }
  }

  function handleDeliveryOptionSelect(option: "ready" | "home") {
    if (option === "ready" && !canReadyDelivery) return;
    if (option === "home" && !canHomeDelivery) return;
    setDeliveryType(option);
    requestAnimationFrame(() => {
      if (option === "ready") {
        wizardConfirmButtonRef.current?.focus();
      } else {
        addAddressButtonRef.current?.focus();
      }
    });
  }

  function handleDeliveryOptionKeyDown(
    option: "ready" | "home",
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      if (canHomeDelivery) {
        setDeliveryType("home");
        deliveryHomeButtonRef.current?.focus();
      }
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      if (canReadyDelivery) {
        setDeliveryType("ready");
        deliveryReadyButtonRef.current?.focus();
      }
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleDeliveryOptionSelect(option);
    }
  }

  function saveAddressDraft() {
    if (selectedCustomerId == null) return;
    if (
      !addressDraft.label.trim() ||
      !addressDraft.street.trim() ||
      !addressDraft.number.trim() ||
      !addressDraft.neighborhood.trim() ||
      !addressDraft.city.trim() ||
      !addressDraft.state.trim() ||
      !addressDraft.zipCode.trim()
    ) {
      return;
    }

    setAddressesByCustomer((prev) => {
      const current = prev[selectedCustomerId] ?? [];
      if (editingAddressId == null) {
        const nextId =
          current.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        const created = { ...addressDraft, id: nextId };
        setSelectedAddressId(created.id);
        return { ...prev, [selectedCustomerId]: [...current, created] };
      }

      const updated = current.map((item) =>
        item.id === editingAddressId
          ? { ...addressDraft, id: editingAddressId }
          : item,
      );
      return { ...prev, [selectedCustomerId]: updated };
    });

    setShowAddressModal(false);
  }

  const isPaymentValid =
    paymentMethods.length > 0 &&
    paymentMethods.every((method) => (paymentAmounts[method] ?? 0) > 0) &&
    paymentAllocatedCents === totalCents;

  useEffect(() => {
    const computed = Math.max(
      0,
      Math.round(subtotalCents * (1 - discountPercent / 100)),
    );
    setTotalCents(computed);
  }, [discountPercent, subtotalCents]);

  useEffect(() => {
    if (!selectedCustomer) return;
    setAddressesByCustomer((prev) => {
      if (prev[selectedCustomer.id]?.length) return prev;
      return {
        ...prev,
        [selectedCustomer.id]: buildDefaultAddresses(selectedCustomer),
      };
    });
  }, [selectedCustomer]);

  useEffect(() => {
    if (activeAddresses.length === 0) {
      setSelectedAddressId(null);
      return;
    }
    if (selectedAddressId == null) {
      setSelectedAddressId(activeAddresses[0].id);
      return;
    }
    const exists = activeAddresses.some(
      (address) => address.id === selectedAddressId,
    );
    if (!exists) setSelectedAddressId(activeAddresses[0].id);
  }, [activeAddresses, selectedAddressId]);

  useEffect(() => {
    if (paymentMethods.length === 0) return;
    setPaymentAmounts((prev) => {
      const next = { ...prev };
      const activeTotal = paymentMethods.reduce(
        (sum, method) => sum + (next[method] ?? 0),
        0,
      );

      if (paymentMethods.length === 1) {
        next[paymentMethods[0]] = totalCents;
        return next;
      }

      const diff = totalCents - activeTotal;
      const first = paymentMethods[0];
      next[first] = Math.max(0, (next[first] ?? 0) + diff);
      return next;
    });
  }, [paymentMethods, totalCents]);

  useEffect(() => {
    if (pendingScrollItemId == null) return;
    const target = document.querySelector<HTMLElement>(
      `[data-cart-item-id=\"${pendingScrollItemId}\"]`,
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    setPendingScrollItemId(null);
  }, [cart, pendingScrollItemId]);

  function focusSearchInput() {
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }

  function addToCart(item: CatalogItemResponse) {
    setCart((prev) => {
      const existingIndex = prev.findIndex((line) => line.itemId === item.id);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const next = prev.filter((line) => line.itemId !== item.id);
        next.push({ ...existing, quantity: existing.quantity + 1 });
        return next;
      }
      return [
        ...prev,
        {
          itemId: item.id,
          quantity: 1,
          unitPriceCents: item.priceCents,
        },
      ];
    });
    setPendingScrollItemId(item.id);
    focusSearchInput();
  }

  function handleItemSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setSearchItem("");
      setActiveCatalogIndex(0);
      return;
    }

    if (filteredCatalogItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveCatalogIndex((prev) => (prev + 1) % filteredCatalogItems.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveCatalogIndex((prev) =>
        prev === 0 ? filteredCatalogItems.length - 1 : prev - 1,
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredCatalogItems[activeCatalogIndex];
      if (!selected) return;
      addToCart(selected);
    }
  }

  function increase(itemId: number) {
    setCart((prev) =>
      prev.map((line) =>
        line.itemId === itemId
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      ),
    );
    setPendingScrollItemId(itemId);
    focusSearchInput();
  }

  function setQuantity(itemId: number, value: string) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    const quantity = Math.max(1, parsed);
    setCart((prev) =>
      prev.map((line) =>
        line.itemId === itemId ? { ...line, quantity } : line,
      ),
    );
  }

  function decrease(itemId: number) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.itemId === itemId
            ? { ...line, quantity: Math.max(0, line.quantity - 1) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
    focusSearchInput();
  }

  function updateUnitPrice(itemId: number, value: string) {
    const parsed = Number.parseFloat(value || "0");
    const next = Number.isNaN(parsed)
      ? 0
      : Math.max(0, Math.round(parsed * 100));
    setCart((prev) =>
      prev.map((line) =>
        line.itemId === itemId ? { ...line, unitPriceCents: next } : line,
      ),
    );
    focusSearchInput();
  }

  function updateDiscountPercent(value: string) {
    const parsed = Number.parseFloat(value || "0");
    const next = Number.isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
    setDiscountPercent(next);
  }

  function updateTotal(value: string) {
    const parsed = Number.parseFloat(value || "0");
    const nextCents = Number.isNaN(parsed)
      ? 0
      : Math.max(0, Math.round(parsed * 100));
    const safeTotal = Math.min(nextCents, subtotalCents);
    setTotalCents(safeTotal);

    if (subtotalCents <= 0) {
      setDiscountPercent(0);
      return;
    }

    const percent = ((subtotalCents - safeTotal) / subtotalCents) * 100;
    setDiscountPercent(Math.min(100, Math.max(0, Number(percent.toFixed(2)))));
  }

  function handleCustomerSearchKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredCustomers.length === 0) return;
      setActiveCustomerIndex((prev) => (prev + 1) % filteredCustomers.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredCustomers.length === 0) return;
      setActiveCustomerIndex((prev) =>
        prev === 0 ? filteredCustomers.length - 1 : prev - 1,
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const chosen = filteredCustomers[activeCustomerIndex];
      if (!chosen) return;
      setSelectedCustomerId(chosen.id);
      setShowCustomerSearch(false);
      focusSearchInput();
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setShowCustomerSearch(false);
      focusSearchInput();
    }
  }

  function handleOpenCustomerSearch() {
    setCustomerQuery("");
    setActiveCustomerIndex(0);
    setShowCustomerSearch(true);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        setKeepFullscreen(false);
        await document.exitFullscreen();
      } else {
        setKeepFullscreen(true);
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
    } finally {
      setTimeout(() => {
        focusSearchInput();
      }, 80);
    }
  }

  async function handleCloseOverlay() {
    setKeepFullscreen(false);
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // noop
      }
    }
    onClose();
  }

  async function confirmFullscreenPrompt(
    choice: "sim" | "nao" = fullscreenPromptChoice,
  ) {
    setKeepFullscreen(choice === "sim");
    if (choice === "sim" && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // noop
      }
    }
    setShowFullscreenPrompt(false);
  }

  function handleFinalize() {
    if (!selectedCustomer || !isPaymentValid) return;
    if (deliveryType === "home" && !selectedAddress) return;
    const splits: PaymentSplit[] = paymentMethods.map((method) => ({
      method,
      amountCents: paymentAmounts[method] ?? 0,
    }));
    onFinalize({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      lines: cart,
      discountCents,
      subtotalCents,
      totalCents,
      paymentMethod: splits[0]?.method ?? "pix",
      paymentMethods: splits,
      cardBrand: paymentMethods.includes("cartao") ? cardBrand : null,
      installments: paymentMethods.includes("cartao") ? installments : null,
      pixKey: paymentMethods.includes("pix") ? pixKey : null,
      deliveryAddressId:
        deliveryType === "home" ? (selectedAddress?.id ?? null) : null,
      deliveryAddress:
        deliveryType === "home"
          ? selectedAddress
            ? formatAddress(selectedAddress)
            : null
          : "Pronta entrega",
    });
    setShowWizard(false);
  }

  useEffect(() => {
    if (!showCustomerSearch) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCustomerSearch(false);
        focusSearchInput();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCustomerSearch]);

  useEffect(() => {
    if (!showWizard) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowWizard(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showWizard]);

  useEffect(() => {
    if (!showWizard || wizardStep !== 2) return;
    requestAnimationFrame(() => {
      if (deliveryType === "ready") {
        deliveryReadyButtonRef.current?.focus();
      } else {
        deliveryHomeButtonRef.current?.focus();
      }
    });
  }, [canHomeDelivery, canReadyDelivery, deliveryType, showWizard, wizardStep]);

  useEffect(() => {
    setActiveCustomerIndex(0);
  }, [customerQuery]);

  useEffect(() => {
    setActiveCatalogIndex(0);
  }, [searchItem]);

  useEffect(() => {
    if (filteredCatalogItems.length === 0) return;
    const maxIndex = filteredCatalogItems.length - 1;
    if (activeCatalogIndex > maxIndex) {
      setActiveCatalogIndex(maxIndex);
      return;
    }
    const activeItem = filteredCatalogItems[activeCatalogIndex];
    if (!activeItem) return;
    const target = document.querySelector<HTMLElement>(
      `[data-search-item-id=\"${activeItem.id}\"]`,
    );
    target?.scrollIntoView({ block: "nearest" });
  }, [activeCatalogIndex, filteredCatalogItems]);

  useEffect(() => {
    if (!showFullscreenPrompt) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        setFullscreenPromptChoice((prev) => (prev === "sim" ? "nao" : "sim"));
      }
      if (event.key === "Enter") {
        event.preventDefault();
        void confirmFullscreenPrompt();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showFullscreenPrompt, fullscreenPromptChoice]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col overflow-hidden bg-slate-200 text-[17px] text-foreground">
      <header className="border-b border-border/70 bg-slate-100 px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold">{title}</h2>
              <button
                type="button"
                onClick={handleOpenCustomerSearch}
                className="mt-1 inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-muted-foreground transition-colors hover:border-primary/40"
              >
                <span className="truncate text-sm font-medium text-foreground/80">
                  {selectedCustomer?.name ?? "Selecionar cliente"}
                </span>
                {selectedCustomer && (
                  <span className="text-sm font-medium text-muted-foreground">
                    #{selectedCustomer.id}
                  </span>
                )}
                <ChevronDown size={16} className="shrink-0" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              onMouseDown={(e) => e.preventDefault()}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            </button>

            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              disabled={cart.length === 0}
              className="rounded-md border border-border/80 bg-slate-50 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpar Orçamento
            </button>

            <button
              type="button"
              onClick={() => setShowWizard(true)}
              disabled={cart.length === 0 || !selectedCustomer}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Finalizar Orçamento
            </button>

            <button
              type="button"
              onClick={() => void handleCloseOverlay()}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50"
            >
              <X size={16} />
              Fechar
            </button>
          </div>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="flex min-h-0 flex-col rounded-xl border border-slate-300 bg-slate-100">
          <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                ref={searchInputRef}
                autoFocus
                type="text"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value.toUpperCase())}
                onKeyDown={handleItemSearchKeyDown}
                placeholder="Buscar item pelo nome..."
                className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-[17px] font-medium uppercase outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-200/70 p-3">
            {isCatalogLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Carregando itens...
              </p>
            ) : filteredCatalogItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum item encontrado.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredCatalogItems.map((item) => (
                  <article
                    key={item.id}
                    data-search-item-id={item.id}
                    className={`flex items-center gap-3 rounded-[3px] border px-3 py-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.12)] ${
                      filteredCatalogItems[activeCatalogIndex]?.id === item.id
                        ? "border-primary/70 bg-white ring-1 ring-primary/25"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100">
                      <Package size={22} className="text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[17px] font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        Unitário R$:{" "}
                        {formatCurrencyCode(item.priceCents, currencyCode)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      onMouseDown={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                      <Plus size={16} />
                      Adicionar
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-xl border border-slate-300 bg-slate-100">
          <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
            <h3 className="text-lg font-semibold">
              Itens do Orçamento ({cartQty} {cartQty === 1 ? "item" : "itens"})
            </h3>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-slate-200/70 p-3">
            {cart.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Adicione itens para montar o orçamento.
              </p>
            ) : (
              cart.map((line) => {
                const item = catalogById.get(line.itemId);
                const lineTotalCents = line.quantity * line.unitPriceCents;
                return (
                  <article
                    key={line.itemId}
                    data-cart-item-id={line.itemId}
                    className="space-y-1 rounded-[3px] border border-slate-300 bg-white px-3 py-2 shadow-[0_2px_8px_rgba(15,23,42,0.12)]"
                  >
                    <div className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-1">
                      <div className="min-w-0">
                        <p className="truncate text-[19px] font-semibold leading-tight text-slate-900">
                          {item?.name ?? `Item #${line.itemId}`}
                        </p>
                        <p className="text-xs font-medium text-slate-600">
                          Total do item:{" "}
                          {formatCurrencyCode(lineTotalCents, currencyCode)}
                        </p>
                      </div>

                      <div className="row-span-2 ml-4 flex min-w-[170px] items-center justify-center gap-1.5 self-center justify-self-end">
                        <button
                          type="button"
                          onClick={() => decrease(line.itemId)}
                          onMouseDown={(e) => e.preventDefault()}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-base transition-colors hover:bg-slate-100"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={line.quantity}
                          onChange={(e) =>
                            setQuantity(
                              line.itemId,
                              e.target.value.replace(/[^0-9]/g, ""),
                            )
                          }
                          className="h-9 w-12 rounded-md border border-slate-300 bg-slate-50 text-center text-lg font-semibold tabular-nums text-slate-900 outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                          type="button"
                          onClick={() => increase(line.itemId)}
                          onMouseDown={(e) => e.preventDefault()}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-base transition-colors hover:bg-slate-100"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">
                          Unitário R$:
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={(line.unitPriceCents / 100).toFixed(2)}
                          onChange={(e) =>
                            updateUnitPrice(line.itemId, e.target.value)
                          }
                          className="w-36 rounded-md border border-transparent bg-transparent px-2 py-1 text-left text-base font-medium outline-none transition-colors hover:border-slate-300 hover:bg-slate-50 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="space-y-3 border-t border-border/70 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-base">
              <span className="font-medium text-muted-foreground">
                Subtotal
              </span>
              <span className="text-xl font-semibold tabular-nums">
                {formatCurrencyCode(subtotalCents, currencyCode)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-base">
              <label className="font-semibold text-slate-700">
                Desconto (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discountPercent.toFixed(2)}
                onChange={(e) => updateDiscountPercent(e.target.value)}
                className="w-32 rounded-md border border-input bg-background px-2 py-1.5 text-right text-base font-medium outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="text-xl font-semibold">Total</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={(totalCents / 100).toFixed(2)}
                onChange={(e) => updateTotal(e.target.value)}
                className="w-44 rounded-md border border-primary/30 bg-white px-2 py-1.5 text-right text-2xl font-bold text-primary tabular-nums outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </section>
      </main>

      {showCustomerSearch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4">
          <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h3 className="text-lg font-semibold">Selecionar cliente</h3>
                <p className="text-sm text-muted-foreground">
                  Busque por nome e selecione o customer ID.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCustomerSearch(false);
                  focusSearchInput();
                }}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="border-b border-border px-4 py-3">
              <input
                autoFocus
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                onKeyDown={handleCustomerSearchKeyDown}
                placeholder="Buscar customer por nome..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCustomers.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                  Nenhum customer encontrado.
                </p>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      setSelectedCustomerId(customer.id);
                      setShowCustomerSearch(false);
                      focusSearchInput();
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      index === activeCustomerIndex
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ID #{customer.id}
                    </span>
                  </button>
                ))
              )}
            </div>

            <footer className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
              ↑ ↓ navegar • Enter selecionar • Esc fechar
            </footer>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Limpar orçamento?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Todos os itens do orçamento atual serão removidos.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setCart([]);
                  setDiscountPercent(0);
                  setTotalCents(0);
                  setShowClearConfirm(false);
                  focusSearchInput();
                }}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Confirmar limpeza
              </button>
            </div>
          </div>
        </div>
      )}

      {showWizard && (
        <div className="fixed inset-0 z-[60] bg-black/40">
          <div className="mx-auto flex h-screen w-full min-w-[320px] max-w-[1400px] flex-col bg-white shadow-2xl">
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">
                    Finalizar Orçamento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Revise pagamento e entrega
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X size={16} />
              </button>
            </div>

            <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    Total a receber
                  </p>
                  <p className="text-4xl font-bold text-primary">
                    {formatCurrencyCode(totalCents, currencyCode)}
                  </p>
                </div>
                <div className="w-full max-w-sm">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
                    <span className={wizardStep === 1 ? "text-primary" : ""}>
                      1. Pagamento
                    </span>
                    <span className={wizardStep === 2 ? "text-primary" : ""}>
                      2. Entrega
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: wizardStep === 1 ? "50%" : "100%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {wizardStep === 1 ? (
                  <>
                    <p className="text-lg font-semibold">
                      Formas de pagamento (combine se necessário)
                    </p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {(
                        [
                          { key: "pix", label: "PIX", icon: QrCode },
                          { key: "cartao", label: "Cartão", icon: CreditCard },
                          { key: "boleto", label: "Boleto", icon: ReceiptText },
                          {
                            key: "dinheiro",
                            label: "Dinheiro",
                            icon: Banknote,
                          },
                        ] as Array<{
                          key: PaymentMethod;
                          label: string;
                          icon: typeof QrCode;
                        }>
                      )
                        .filter((option) =>
                          availablePaymentMethods.includes(option.key),
                        )
                        .map((option) => {
                          const Icon = option.icon;
                          const selected = paymentMethods.includes(option.key);
                          return (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => togglePaymentMethod(option.key)}
                              className={`flex h-24 flex-col items-center justify-center rounded-lg border px-2 text-center transition-colors ${
                                selected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-slate-300 bg-white hover:bg-slate-50"
                              }`}
                            >
                              <Icon size={34} />
                              <span className="mt-2 text-base font-semibold">
                                {option.label}
                              </span>
                            </button>
                          );
                        })}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-700">
                        Divisão dos valores
                      </p>
                      <div className="space-y-2">
                        {paymentMethods.map((method) => (
                          <div
                            key={method}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="text-sm font-medium capitalize">
                              {method}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={(
                                (paymentAmounts[method] ?? 0) / 100
                              ).toFixed(2)}
                              onChange={(e) =>
                                updatePaymentAmount(method, e.target.value)
                              }
                              className="w-36 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-right text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                        ))}
                      </div>
                      <p
                        className={`mt-3 text-sm font-semibold ${paymentRemainingCents === 0 ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        Restante:{" "}
                        {formatCurrencyCode(
                          paymentRemainingCents,
                          currencyCode,
                        )}
                      </p>
                    </div>

                    {paymentMethods.includes("pix") && (
                      <div className="rounded-lg border border-slate-200 p-4">
                        <p className="text-sm font-semibold">Chave PIX</p>
                        <p className="mt-1 break-all rounded-md bg-slate-50 px-2 py-2 text-sm">
                          {pixKey}
                        </p>
                        <button
                          type="button"
                          onClick={() => void copyPixKey()}
                          className="mt-2 inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                          <Copy size={14} />
                          Copiar chave
                        </button>
                      </div>
                    )}

                    {paymentMethods.includes("cartao") && (
                      <div className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-semibold">
                            Bandeira
                          </label>
                          <select
                            value={cardBrand}
                            onChange={(e) => setCardBrand(e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="visa">Visa</option>
                            <option value="mastercard">Mastercard</option>
                            <option value="elo">Elo</option>
                            <option value="amex">Amex</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-semibold">
                            Parcelamento
                          </label>
                          <select
                            value={installments}
                            onChange={(e) =>
                              setInstallments(Number(e.target.value))
                            }
                            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            {Array.from(
                              {
                                length:
                                  commerceSettings.payment.maxInstallments,
                              },
                              (_, index) => index + 1,
                            ).map((value) => (
                              <option key={value} value={value}>
                                {value}x
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {paymentMethods.includes("boleto") && (
                      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 p-4">
                        <button
                          type="button"
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                          Imprimir boleto
                        </button>
                        {commerceSettings.payment.boletoSendByEmail && (
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                          >
                            Enviar por e-mail
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold">Entrega</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {canReadyDelivery && (
                        <button
                          ref={deliveryReadyButtonRef}
                          type="button"
                          onClick={() => handleDeliveryOptionSelect("ready")}
                          onKeyDown={(event) =>
                            handleDeliveryOptionKeyDown("ready", event)
                          }
                          className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                            deliveryType === "ready"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-slate-300 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Package size={24} />
                            <span>
                              <span className="block text-base font-semibold">
                                Pronta entrega
                              </span>
                              <span className="block text-sm opacity-80">
                                (Não se aplica)
                              </span>
                            </span>
                          </span>
                        </button>
                      )}
                      {canHomeDelivery && (
                        <button
                          ref={deliveryHomeButtonRef}
                          type="button"
                          onClick={() => handleDeliveryOptionSelect("home")}
                          onKeyDown={(event) =>
                            handleDeliveryOptionKeyDown("home", event)
                          }
                          className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                            deliveryType === "home"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-slate-300 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <MapPin size={24} />
                            <span>
                              <span className="block text-base font-semibold">
                                Entrega a Domicílio
                              </span>
                              <span className="block text-sm opacity-80">
                                Selecionar endereço
                              </span>
                            </span>
                          </span>
                        </button>
                      )}
                    </div>

                    {!canReadyDelivery && !canHomeDelivery && (
                      <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        Nenhuma modalidade de entrega está habilitada nas
                        Configurações.
                      </div>
                    )}

                    {deliveryType === "home" && (
                      <>
                        <div className="flex justify-end">
                          <button
                            ref={addAddressButtonRef}
                            type="button"
                            onClick={() => openAddressModal()}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                          >
                            + Adicionar endereço
                          </button>
                        </div>

                        <div className="space-y-2">
                          {activeAddresses.map((address) => (
                            <div
                              key={address.id}
                              className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
                                selectedAddressId === address.id
                                  ? "border-primary bg-primary/5"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              <label className="flex flex-1 cursor-pointer items-start gap-2">
                                <input
                                  type="radio"
                                  name="delivery-address"
                                  checked={selectedAddressId === address.id}
                                  onChange={() =>
                                    setSelectedAddressId(address.id)
                                  }
                                  className="mt-1"
                                />
                                <div>
                                  <p className="text-sm font-semibold">
                                    {address.label}
                                  </p>
                                  <p className="text-sm text-slate-700">
                                    {formatAddress(address)}
                                  </p>
                                </div>
                              </label>
                              <button
                                type="button"
                                onClick={() => openAddressModal(address)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50"
                              >
                                <MapPin size={14} />
                                Editar
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0 flex justify-between border-t border-slate-200 bg-white px-6 py-4">
              {wizardStep === 2 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="rounded-md border border-border px-3 py-2 text-sm"
                >
                  Voltar
                </button>
              ) : (
                <span />
              )}

              {wizardStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  disabled={!isPaymentValid}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  Continuar
                </button>
              ) : (
                <button
                  ref={wizardConfirmButtonRef}
                  type="button"
                  onClick={handleFinalize}
                  disabled={deliveryType === "home" && !selectedAddress}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  Confirmar e enviar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddressModal && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-300 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h4 className="text-lg font-semibold">
                {editingAddressId ? "Editar endereço" : "Adicionar endereço"}
              </h4>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-3 px-5 py-4 md:grid-cols-2">
              {(
                [
                  ["label", "Apelido"],
                  ["street", "Rua"],
                  ["number", "Número"],
                  ["complement", "Complemento"],
                  ["neighborhood", "Bairro"],
                  ["city", "Cidade"],
                  ["state", "Estado"],
                  ["zipCode", "CEP"],
                ] as Array<[keyof DeliveryAddress, string]>
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="text-sm font-medium text-slate-700">
                    {label}
                  </label>
                  <input
                    value={addressDraft[field]}
                    onChange={(e) =>
                      setAddressDraft((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveAddressDraft}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Salvar endereço
              </button>
            </div>
          </div>
        </div>
      )}

      {showFullscreenPrompt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-white p-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Maximize2 size={22} />
              </div>
              <h3 className="text-2xl font-semibold">Exibição em Tela Cheia</h3>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-slate-700">
              A experiência desta tela fica melhor em tela cheia. Deseja a
              exibição de tela cheia?
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setFullscreenPromptChoice("sim");
                  void confirmFullscreenPrompt("sim");
                }}
                className={`rounded-lg border px-6 py-5 text-xl font-semibold ${
                  fullscreenPromptChoice === "sim"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => {
                  setFullscreenPromptChoice("nao");
                  void confirmFullscreenPrompt("nao");
                }}
                className={`rounded-lg border px-6 py-5 text-xl font-semibold ${
                  fullscreenPromptChoice === "nao"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                Não
              </button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Enter confirma • Setas esquerda/direita alternam entre Sim e Não
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
