import { useMemo, useState } from "react";
import { Minus, Package, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrencyCode } from "@/lib/utils/formatCurrency";
import type { CatalogItemResponse } from "@/features/orders/types/orderTypes";

export interface BudgetComposerLine {
  itemId: number;
  quantity: number;
  unitPriceCents: number;
}

interface OrderBudgetComposerProps {
  catalogItems: CatalogItemResponse[];
  lines: BudgetComposerLine[];
  currencyCode?: string;
  notes: string;
  discountCents: number;
  isCatalogLoading?: boolean;
  onAddItem: (item: CatalogItemResponse) => void;
  onIncrease: (itemId: number) => void;
  onDecrease: (itemId: number) => void;
  onRemove: (itemId: number) => void;
  onUnitPriceChange: (itemId: number, unitPriceCents: number) => void;
  onDiscountChange: (discountCents: number) => void;
  onNotesChange: (notes: string) => void;
  className?: string;
}

export function OrderBudgetComposer({
  catalogItems,
  lines,
  currencyCode = "BRL",
  notes,
  discountCents,
  isCatalogLoading = false,
  onAddItem,
  onIncrease,
  onDecrease,
  onRemove,
  onUnitPriceChange,
  onDiscountChange,
  onNotesChange,
  className,
}: OrderBudgetComposerProps) {
  const [search, setSearch] = useState("");

  const catalogById = useMemo(
    () => new Map(catalogItems.map((item) => [item.id, item])),
    [catalogItems],
  );

  const filteredCatalogItems = useMemo(() => {
    if (!search.trim()) return catalogItems;
    const searchTerm = search.toLowerCase();
    return catalogItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm),
    );
  }, [catalogItems, search]);

  const subtotalCents = lines.reduce(
    (acc, line) => acc + line.unitPriceCents * line.quantity,
    0,
  );
  const totalCents = Math.max(0, subtotalCents - discountCents);

  return (
    <div
      className={cn(
        "grid min-h-[520px] overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]",
        className,
      )}
    >
      <section className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
        <div className="border-b border-border px-4 py-3">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar item pelo nome..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isCatalogLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredCatalogItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum item encontrado.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {filteredCatalogItems.map((item) => {
                const line = lines.find((entry) => entry.itemId === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onAddItem(item)}
                    className="group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Package size={24} className="text-muted-foreground" />
                    </div>
                    <p className="line-clamp-2 text-xs font-medium leading-tight">
                      {item.name}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrencyCode(item.priceCents, currencyCode)}
                    </p>
                    {line && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {line.quantity}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="flex min-h-0 flex-col">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">
            Carrinho ({lines.length} {lines.length === 1 ? "item" : "itens"})
          </h3>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {lines.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Adicione itens para montar o pedido.
            </p>
          ) : (
            lines.map((line) => {
              const item = catalogById.get(line.itemId);
              const lineTotal = line.unitPriceCents * line.quantity;
              return (
                <div
                  key={line.itemId}
                  className="space-y-2 rounded-lg border border-border bg-card p-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {item?.name ?? `Item #${line.itemId}`}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatCurrencyCode(line.unitPriceCents, currencyCode)}{" "}
                        cada
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onDecrease(line.itemId)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="w-6 text-center text-xs font-medium tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncrease(line.itemId)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
                      >
                        <Plus size={10} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(line.itemId)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px] text-muted-foreground">
                      Preco unitario (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={(line.unitPriceCents / 100).toFixed(2)}
                      onChange={(e) => {
                        const next = Number.parseFloat(e.target.value || "0");
                        onUnitPriceChange(
                          line.itemId,
                          Math.max(0, Math.round(next * 100)),
                        );
                      }}
                      className="w-28 rounded-md border border-input bg-background px-2 py-1 text-right text-xs outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="text-right text-xs font-semibold tabular-nums">
                    {formatCurrencyCode(lineTotal, currencyCode)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-3 border-t border-border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">
              {formatCurrencyCode(subtotalCents, currencyCode)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm text-muted-foreground">
              Desconto (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={(discountCents / 100).toFixed(2)}
              onChange={(e) => {
                const next = Number.parseFloat(e.target.value || "0");
                onDiscountChange(Math.max(0, Math.round(next * 100)));
              }}
              className="w-24 rounded-md border border-input bg-background px-2 py-1 text-right text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-base font-semibold">Total</span>
            <span className="text-base font-bold text-primary tabular-nums">
              {formatCurrencyCode(totalCents, currencyCode)}
            </span>
          </div>

          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Observacoes do pedido..."
            rows={2}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </section>
    </div>
  );
}
