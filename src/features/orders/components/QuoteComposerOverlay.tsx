import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Maximize2,
  Minimize2,
  Package,
  Plus,
  Search,
  X,
  Minus,
} from "lucide-react";
import { formatCurrencyCode } from "@/lib/utils/formatCurrency";
import type { CatalogItemResponse } from "@/features/orders/types/orderTypes";

interface CustomerOption {
  id: number;
  name: string;
}

interface CartLine {
  itemId: number;
  quantity: number;
  unitPriceCents: number;
}

type PaymentMethod = "pix" | "cartao" | "boleto";
type DeliveryMode = "confirmar" | "novo";

export interface QuoteFinalizePayload {
  customerId: number;
  customerName: string;
  lines: CartLine[];
  discountCents: number;
  subtotalCents: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  deliveryMode: DeliveryMode;
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
  const [searchItem, setSearchItem] = useState("");
  const [activeCatalogIndex, setActiveCatalogIndex] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [totalCents, setTotalCents] = useState(0);
  const [pendingScrollItemId, setPendingScrollItemId] = useState<number | null>(
    null,
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    initialCustomerId ?? null,
  );
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [activeCustomerIndex, setActiveCustomerIndex] = useState(0);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("confirmar");
  const [deliveryAddress, setDeliveryAddress] = useState("");
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
    setPaymentMethod("pix");
    setDeliveryMode("confirmar");
    setDeliveryAddress("");
  }, [customers, initialCustomerId, open]);

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

  useEffect(() => {
    const computed = Math.max(
      0,
      Math.round(subtotalCents * (1 - discountPercent / 100)),
    );
    setTotalCents(computed);
  }, [discountPercent, subtotalCents]);

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
    if (!selectedCustomer) return;
    onFinalize({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      lines: cart,
      discountCents,
      subtotalCents,
      totalCents,
      paymentMethod,
      deliveryMode,
      deliveryAddress:
        deliveryMode === "novo" ? deliveryAddress.trim() || null : null,
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold">Finalizar Orçamento</h3>
                <p className="text-sm text-muted-foreground">
                  Etapa {wizardStep} de 2
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              {wizardStep === 1 ? (
                <>
                  <p className="text-base font-medium">Forma de pagamento</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pix")}
                      className={`rounded-md border px-3 py-2 text-sm font-medium ${
                        paymentMethod === "pix"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      Pix
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cartao")}
                      className={`rounded-md border px-3 py-2 text-sm font-medium ${
                        paymentMethod === "cartao"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      Cartão
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("boleto")}
                      className={`rounded-md border px-3 py-2 text-sm font-medium ${
                        paymentMethod === "boleto"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      Boleto
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-base font-medium">Entrega</p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("confirmar")}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm font-medium ${
                        deliveryMode === "confirmar"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      Confirmar endereço já cadastrado
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("novo")}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm font-medium ${
                        deliveryMode === "novo"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      Inserir novo endereço
                    </button>
                  </div>

                  {deliveryMode === "novo" && (
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={3}
                      placeholder="Rua, número, bairro, cidade, estado, CEP"
                      className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between border-t border-border px-5 py-4">
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
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalize}
                  disabled={deliveryMode === "novo" && !deliveryAddress.trim()}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  Confirmar e enviar
                </button>
              )}
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
