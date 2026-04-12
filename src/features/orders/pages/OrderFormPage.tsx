import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import {
  useOrder,
  useCreateOrder,
  useUpdateOrder,
  useCatalogItems,
  useUsers,
} from "@/features/orders/api/useOrders";
import { useCustomers } from "@/features/customers/api/useCustomers";
import { useTenants } from "@/features/customers/api/useCustomers";
import { cn } from "@/lib/utils";
import type { CatalogItemResponse } from "@/features/orders/types/orderTypes";

// ─── Schema ───────────────────────────────────────────────────────────────────

const orderItemSchema = z.object({
  itemId: z.coerce.number().min(1, "Item obrigatório"),
  quantity: z.coerce.number().min(1, "Quantidade mínima: 1"),
  unitPrice: z.coerce.number().min(0.01, "Preço deve ser positivo"),
});

const schema = z.object({
  tenantId: z.coerce.number().min(1, "Selecione um tenant"),
  customerId: z.coerce.number().min(1, "Selecione um cliente"),
  userId: z.coerce.number().min(1, "Selecione um responsável"),
  status: z.string().default("DRAFT"),
  discount: z.coerce.number().min(0).default(0),
  currencyCode: z.string().default("BRL"),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(0),
});

type FormValues = z.infer<typeof schema>;

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50";

// ─── Customer autocomplete ────────────────────────────────────────────────────

function CustomerAutocomplete({
  tenantId,
  value,
  onChange,
  error,
}: {
  tenantId: number | null;
  value: number | null | undefined;
  onChange: (id: number) => void;
  error?: string;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data } = useCustomers({
    page: 0,
    size: 10,
    tenantId: tenantId ?? undefined,
  });
  const customers = data?.content ?? [];
  const filtered = search
    ? customers.filter((c) =>
        c.fullName.toLowerCase().includes(search.toLowerCase()),
      )
    : customers;
  const selectedName = value
    ? (customers.find((c) => c.id === value)?.fullName ?? `ID ${value}`)
    : "";

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">Cliente *</label>
      <div className="relative">
        <input
          type="text"
          value={open ? search : selectedName}
          onFocus={() => {
            setOpen(true);
            setSearch("");
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className={cn(inputClass, error && "border-destructive")}
        />
        {open && filtered.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-card shadow-md text-sm">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="cursor-pointer px-3 py-2 hover:bg-accent transition-colors"
                onMouseDown={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
              >
                {c.fullName}{" "}
                <span className="text-xs text-muted-foreground">#{c.id}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Item selector ────────────────────────────────────────────────────────────

function ItemSelector({
  items,
  value,
  onChange,
}: {
  items: CatalogItemResponse[];
  value: number;
  onChange: (id: number, priceCents: number) => void;
}) {
  return (
    <select
      value={value || ""}
      onChange={(e) => {
        const id = parseInt(e.target.value, 10);
        const item = items.find((i) => i.id === id);
        onChange(id, item?.priceCents ?? 0);
      }}
      className={cn(inputClass, "bg-background")}
    >
      <option value="">Selecionar item...</option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OrderFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);
  const orderId = isEdit ? parseInt(id!, 10) : null;

  const { data: orderData, isLoading: orderLoading } = useOrder(orderId);
  const { data: tenantsData } = useTenants();
  const { data: usersData } = useUsers();
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();

  const tenants = tenantsData?.content ?? [];
  const users = Array.isArray(usersData) ? usersData : [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "DRAFT",
      currencyCode: "BRL",
      discount: 0,
      items: [],
      customerId: searchParams.get("customerId")
        ? parseInt(searchParams.get("customerId")!, 10)
        : undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedTenantId = watch("tenantId");
  const watchedItems = watch("items");
  const watchedDiscount = watch("discount") ?? 0;
  const watchedCurrency = watch("currencyCode") ?? "BRL";

  const { data: catalogData } = useCatalogItems(
    watchedTenantId ? Number(watchedTenantId) : null,
  );
  const catalogItems = Array.isArray(catalogData) ? catalogData : [];

  // Compute totals
  const subtotalCents = watchedItems.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Math.round((Number(item.unitPrice) || 0) * 100);
    return acc + qty * price;
  }, 0);
  const discountCents = Math.round((Number(watchedDiscount) || 0) * 100);
  const totalCents = Math.max(0, subtotalCents - discountCents);

  function formatCents(cents: number): string {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: watchedCurrency || "BRL",
    });
  }

  // Populate form for edit
  useEffect(() => {
    if (orderData) {
      reset({
        tenantId: orderData.tenantId,
        customerId: orderData.customerId,
        userId: orderData.userId,
        status: orderData.status,
        discount: orderData.discountCents / 100,
        currencyCode: orderData.currencyCode,
        notes: orderData.notes ?? "",
        items: orderData.items.map((i) => ({
          itemId: i.itemId,
          quantity: i.quantity,
          unitPrice: i.unitPriceCents / 100,
        })),
      });
    }
  }, [orderData, reset]);

  async function onSubmit(values: FormValues) {
    const itemsPayload = values.items.map((item) => {
      const unitPriceCents = Math.round(item.unitPrice * 100);
      const totalPriceCents = unitPriceCents * item.quantity;
      return {
        itemId: item.itemId,
        quantity: item.quantity,
        unitPriceCents,
        totalPriceCents,
      };
    });

    const discountC = Math.round((values.discount ?? 0) * 100);
    const subC = itemsPayload.reduce((acc, i) => acc + i.totalPriceCents, 0);
    const totalC = Math.max(0, subC - discountC);

    const body = {
      tenantId: values.tenantId,
      customerId: values.customerId,
      userId: values.userId,
      status: values.status || "DRAFT",
      subtotalCents: subC,
      discountCents: discountC,
      totalCents: totalC,
      currencyCode: values.currencyCode || "BRL",
      notes: values.notes || null,
      items: itemsPayload,
    };

    try {
      let saved: { id: number };
      if (isEdit && orderId) {
        saved = await updateMutation.mutateAsync({ id: orderId, body });
        toast.success("Pedido atualizado com sucesso.");
      } else {
        saved = await createMutation.mutateAsync(body);
        toast.success("Pedido criado com sucesso.");
      }
      void navigate(`/orders/${saved.id}`);
    } catch {
      toast.error("Erro ao salvar pedido. Tente novamente.");
    }
  }

  const isBusy =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  if (isEdit && orderLoading) {
    return (
      <div className="space-y-5 max-w-3xl">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-9 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void navigate("/orders")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Editar pedido" : "Novo pedido"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header fields */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Dados do pedido
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Tenant */}
            <Field label="Tenant *" error={errors.tenantId?.message}>
              <select
                {...register("tenantId")}
                className={cn(inputClass, "bg-background")}
              >
                <option value="">Selecione um tenant...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>

            {/* Status */}
            <Field label="Status" error={errors.status?.message}>
              <select
                {...register("status")}
                className={cn(inputClass, "bg-background")}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </Field>
          </div>

          {/* Cliente */}
          <CustomerAutocomplete
            tenantId={watchedTenantId ? Number(watchedTenantId) : null}
            value={watch("customerId")}
            onChange={(id) => setValue("customerId", id)}
            error={errors.customerId?.message}
          />

          {/* Responsável */}
          <Field label="Responsável *" error={errors.userId?.message}>
            <select
              {...register("userId")}
              className={cn(inputClass, "bg-background")}
            >
              <option value="">Selecione um responsável...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            {/* Desconto */}
            <Field label="Desconto (R$)" error={errors.discount?.message}>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("discount")}
                className={inputClass}
              />
            </Field>

            {/* Moeda */}
            <Field label="Moeda" error={errors.currencyCode?.message}>
              <input
                type="text"
                {...register("currencyCode")}
                className={inputClass}
                placeholder="BRL"
              />
            </Field>
          </div>

          {/* Notas */}
          <Field label="Notas" error={errors.notes?.message}>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Observações sobre este pedido..."
              className={cn(inputClass, "resize-none")}
            />
          </Field>
        </div>

        {/* Items */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Itens do pedido</h2>
            <button
              type="button"
              onClick={() => append({ itemId: 0, quantity: 1, unitPrice: 0 })}
              className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent transition-colors"
            >
              <Plus size={12} />
              Adicionar item
            </button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum item adicionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground bg-muted/40">
                    <th className="px-4 py-2 font-medium">Item</th>
                    <th className="px-4 py-2 font-medium w-24">Qtd.</th>
                    <th className="px-4 py-2 font-medium w-32">Preço unit.</th>
                    <th className="px-4 py-2 font-medium w-32">Total</th>
                    <th className="px-4 py-2 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fields.map((field, index) => {
                    const qty = Number(watchedItems[index]?.quantity) || 0;
                    const price = Number(watchedItems[index]?.unitPrice) || 0;
                    const lineTotal = qty * price;
                    return (
                      <tr key={field.id}>
                        <td className="px-4 py-2">
                          <ItemSelector
                            items={catalogItems}
                            value={watchedItems[index]?.itemId ?? 0}
                            onChange={(id, priceCents) => {
                              setValue(`items.${index}.itemId`, id);
                              if (priceCents > 0) {
                                setValue(
                                  `items.${index}.unitPrice`,
                                  priceCents / 100,
                                );
                              }
                            }}
                          />
                          {errors.items?.[index]?.itemId && (
                            <p className="text-xs text-destructive mt-0.5">
                              {errors.items[index].itemId?.message}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            {...register(`items.${index}.quantity`)}
                            className={inputClass}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`items.${index}.unitPrice`)}
                            className={inputClass}
                          />
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                          {formatCents(Math.round(lineTotal * 100))}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals footer */}
          <div className="border-t border-border px-5 py-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono">{formatCents(subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Desconto</span>
              <span className="font-mono">
                {discountCents > 0 ? `- ${formatCents(discountCents)}` : "—"}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t border-border pt-1.5">
              <span>Total</span>
              <span className="font-mono">{formatCents(totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isBusy || !watch("customerId") || !watch("userId")}
            className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isBusy && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Salvar alterações" : "Criar pedido"}
          </button>
          <button
            type="button"
            onClick={() => void navigate("/orders")}
            disabled={isBusy}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
