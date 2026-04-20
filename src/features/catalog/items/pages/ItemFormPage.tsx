import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useItem,
  useCreateItem,
  useUpdateItem,
} from "@/features/catalog/items/api/useItems";
import { useItemCategoriesCatalog } from "@/features/catalog/categories/api/useItemCategories";
import type {
  ItemType,
  ItemRequest,
  OptionRequest,
  AdditionalRequest,
} from "@/features/catalog/items/types/itemTypes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert display reais string "12,50" to centavos number 1250 */
function reaisToCents(value: string | undefined | null): number | null {
  if (!value) return null;
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : Math.round(n * 100);
}

/** Convert centavos to display string "12,50" */
function centsToReais(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const optionSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  priceDeltaDisplay: z.string().optional(),
  active: z.boolean(),
});

const additionalSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  priceDisplay: z.string().optional(),
  active: z.boolean(),
});

const schema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  categoryId: z.coerce.number().nullable().optional(),
  sku: z.string().optional(),
  active: z.boolean(),
  tags: z.string().optional(),
  // Product datasheet
  description: z.string().optional(),
  unitPriceDisplay: z.string().optional(),
  currencyCode: z.string().optional(),
  unitOfMeasureId: z.coerce.number().nullable().optional(),
  weightKg: z.coerce.number().nullable().optional(),
  volumeM3: z.coerce.number().nullable().optional(),
  densityKgM3: z.coerce.number().nullable().optional(),
  heightCm: z.coerce.number().nullable().optional(),
  widthCm: z.coerce.number().nullable().optional(),
  lengthCm: z.coerce.number().nullable().optional(),
  // Service datasheet
  durationMinutes: z.coerce.number().nullable().optional(),
  requiresStaff: z.boolean().optional(),
  bufferMinutes: z.coerce.number().nullable().optional(),
  // Options & additionals
  options: z.array(optionSchema).optional(),
  additionals: z.array(additionalSchema).optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Field Error ──────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Category Autocomplete ────────────────────────────────────────────────────

interface CategoryAutocompleteProps {
  value: number | null | undefined;
  onChange: (id: number | null) => void;
  itemType: ItemType;
}

function CategoryAutocomplete({ value, onChange, itemType }: CategoryAutocompleteProps) {
  const { data: allCategories = [] } = useItemCategoriesCatalog();
  const categories = useMemo(
    () => allCategories.filter((c) => c.availableTypes?.includes(itemType)),
    [allCategories, itemType],
  );

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.id === value);

  const filtered = search.trim()
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      )
    : categories;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
        className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected ? selected.name : "Selecionar categoria..."}
        </span>
        <div className="flex items-center gap-1">
          {selected && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="rounded p-0.5 hover:bg-accent"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14} className="text-muted-foreground" />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoria..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-muted-foreground">
                Nenhuma categoria encontrada
              </li>
            ) : (
              filtered.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(cat.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                      cat.id === value && "bg-accent font-medium",
                    )}
                  >
                    {cat.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-border pb-2 pt-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ItemFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const itemId = id ? Number(id) : null;

  // Derive type from path or query
  const pathType: ItemType | null = location.pathname.includes("/catalog/products")
    ? "PRODUCT"
    : location.pathname.includes("/catalog/services")
      ? "SERVICE"
      : null;
  const queryType = searchParams.get("type");
  const paramType: ItemType | null =
    queryType === "SERVICE" || queryType === "PRODUCT" ? queryType : null;

  const { data: existing, isLoading: isLoadingExisting } = useItem(itemId);
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();

  const resolvedType: ItemType = existing?.type ?? pathType ?? paramType ?? "PRODUCT";
  const isProduct = resolvedType === "PRODUCT";
  const isService = resolvedType === "SERVICE";
  const resolvedTypeLabel = isService ? "Servico" : "Produto";
  const listPath = isService ? "/catalog/services" : "/catalog/products";

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      categoryId: null,
      sku: "",
      active: true,
      tags: "",
      description: "",
      unitPriceDisplay: "",
      currencyCode: "BRL",
      unitOfMeasureId: null,
      weightKg: null,
      volumeM3: null,
      densityKgM3: null,
      heightCm: null,
      widthCm: null,
      lengthCm: null,
      durationMinutes: null,
      requiresStaff: false,
      bufferMinutes: null,
      options: [],
      additionals: [],
    },
  });

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: "options" });

  const {
    fields: additionalFields,
    append: appendAdditional,
    remove: removeAdditional,
  } = useFieldArray({ control, name: "additionals" });

  useEffect(() => {
    if (!existing) return;
    const ds = isProduct ? existing.productDatasheet : existing.serviceDatasheet;
    reset({
      name: existing.name,
      categoryId: existing.categoryId ?? null,
      sku: existing.sku ?? "",
      active: existing.active,
      tags: (existing.tags ?? []).join(", "),
      description: ds?.description ?? "",
      unitPriceDisplay: centsToReais(ds?.unitPriceCents),
      currencyCode: ds?.currencyCode ?? "BRL",
      // Product-specific
      unitOfMeasureId: (existing.productDatasheet as Record<string, unknown>)?.unitOfMeasureId as number | null ?? null,
      weightKg: (existing.productDatasheet as Record<string, unknown>)?.weightKg as number | null ?? null,
      volumeM3: (existing.productDatasheet as Record<string, unknown>)?.volumeM3 as number | null ?? null,
      densityKgM3: (existing.productDatasheet as Record<string, unknown>)?.densityKgM3 as number | null ?? null,
      heightCm: (existing.productDatasheet as Record<string, unknown>)?.heightCm as number | null ?? null,
      widthCm: (existing.productDatasheet as Record<string, unknown>)?.widthCm as number | null ?? null,
      lengthCm: (existing.productDatasheet as Record<string, unknown>)?.lengthCm as number | null ?? null,
      // Service-specific
      durationMinutes: (existing.serviceDatasheet as Record<string, unknown>)?.durationMinutes as number | null ?? null,
      requiresStaff: !!(existing.serviceDatasheet as Record<string, unknown>)?.requiresStaff,
      bufferMinutes: (existing.serviceDatasheet as Record<string, unknown>)?.bufferMinutes as number | null ?? null,
      // Options & additionals
      options: (existing.options ?? []).map((o) => ({
        name: o.name,
        priceDeltaDisplay: centsToReais(o.priceDeltaCents),
        active: o.active,
      })),
      additionals: (existing.additionals ?? []).map((a) => ({
        name: a.name,
        priceDisplay: centsToReais(a.priceCents),
        active: a.active,
      })),
    });
  }, [existing, reset, isProduct]);

  async function onSubmit(values: FormValues) {
    try {
      const tags = values.tags
        ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const options: OptionRequest[] = (values.options ?? []).map((o) => ({
        name: o.name,
        priceDeltaCents: reaisToCents(o.priceDeltaDisplay),
        active: o.active,
      }));

      const additionals: AdditionalRequest[] = (values.additionals ?? []).map((a) => ({
        name: a.name,
        priceCents: reaisToCents(a.priceDisplay),
        active: a.active,
      }));

      const body: ItemRequest = {
        tenantId: existing?.tenantId ?? 1,
        categoryId: values.categoryId ?? null,
        name: values.name,
        type: resolvedType,
        sku: values.sku || null,
        tags,
        options,
        additionals,
        active: values.active,
      };

      if (isProduct) {
        body.productDatasheet = {
          description: values.description || null,
          unitPriceCents: reaisToCents(values.unitPriceDisplay),
          currencyCode: values.currencyCode || "BRL",
          unitOfMeasureId: values.unitOfMeasureId ?? null,
          weightKg: values.weightKg ?? null,
          volumeM3: values.volumeM3 ?? null,
          densityKgM3: values.densityKgM3 ?? null,
          heightCm: values.heightCm ?? null,
          widthCm: values.widthCm ?? null,
          lengthCm: values.lengthCm ?? null,
        };
      } else {
        body.serviceDatasheet = {
          description: values.description || null,
          unitPriceCents: reaisToCents(values.unitPriceDisplay),
          currencyCode: values.currencyCode || "BRL",
          durationMinutes: values.durationMinutes ?? null,
          requiresStaff: values.requiresStaff ?? false,
          bufferMinutes: values.bufferMinutes ?? null,
        };
      }

      if (isEditing && itemId !== null) {
        await updateMutation.mutateAsync({ id: itemId, body });
        toast.success(`${resolvedTypeLabel} atualizado com sucesso.`);
      } else {
        await createMutation.mutateAsync(body);
        toast.success(`${resolvedTypeLabel} criado com sucesso.`);
      }
      void navigate(listPath);
    } catch {
      toast.error(`Erro ao salvar ${resolvedTypeLabel.toLowerCase()}.`);
    }
  }

  if (isEditing && isLoadingExisting) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void navigate(listPath)}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEditing ? `Editar ${resolvedTypeLabel}` : `Novo ${resolvedTypeLabel}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEditing
              ? `Atualize as informacoes do ${resolvedTypeLabel.toLowerCase()}`
              : `Preencha os dados para criar um novo ${resolvedTypeLabel.toLowerCase()}`}
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className="space-y-6"
      >
        {/* ── General info ───────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <SectionHeader title="Informacoes Gerais" />

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Nome <span className="text-destructive">*</span>
            </label>
            <input
              {...register("name")}
              placeholder={isProduct ? "Ex: Cafe Expresso" : "Ex: Corte de Cabelo"}
              className={cn(inputClass, errors.name && "border-destructive")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Categoria</label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <CategoryAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    itemType={resolvedType}
                  />
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">SKU</label>
              <input
                {...register("sku")}
                placeholder="Codigo interno"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tags</label>
            <input
              {...register("tags")}
              placeholder="Separadas por virgula: promo, destaque"
              className={inputClass}
            />
            <p className="text-[11px] text-muted-foreground">Separe com virgula</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              {...register("active")}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <label htmlFor="active" className="text-sm">Ativo</label>
          </div>
        </div>

        {/* ── Datasheet (Product) ────────────────────────────────────── */}
        {isProduct && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <SectionHeader title="Ficha Tecnica do Produto" />

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descricao</label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Descricao detalhada do produto..."
                className={cn(inputClass, "resize-none")}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Preco Unitario (R$)</label>
                <input
                  {...register("unitPriceDisplay")}
                  placeholder="0,00"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Moeda</label>
                <input
                  {...register("currencyCode")}
                  placeholder="BRL"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Unid. Medida (ID)</label>
                <input
                  type="number"
                  {...register("unitOfMeasureId")}
                  placeholder="ID"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Peso (kg)</label>
                <input
                  type="number"
                  step="any"
                  {...register("weightKg")}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Volume (m3)</label>
                <input
                  type="number"
                  step="any"
                  {...register("volumeM3")}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Densidade (kg/m3)</label>
                <input
                  type="number"
                  step="any"
                  {...register("densityKgM3")}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Altura (cm)</label>
                <input
                  type="number"
                  step="any"
                  {...register("heightCm")}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Largura (cm)</label>
                <input
                  type="number"
                  step="any"
                  {...register("widthCm")}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Comprimento (cm)</label>
                <input
                  type="number"
                  step="any"
                  {...register("lengthCm")}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Datasheet (Service) ────────────────────────────────────── */}
        {isService && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <SectionHeader title="Ficha Tecnica do Servico" />

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descricao</label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Descricao detalhada do servico..."
                className={cn(inputClass, "resize-none")}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Preco Unitario (R$)</label>
                <input
                  {...register("unitPriceDisplay")}
                  placeholder="0,00"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Moeda</label>
                <input
                  {...register("currencyCode")}
                  placeholder="BRL"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Duracao (min)</label>
                <input
                  type="number"
                  {...register("durationMinutes")}
                  placeholder="60"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Buffer entre agendamentos (min)</label>
                <input
                  type="number"
                  {...register("bufferMinutes")}
                  placeholder="15"
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="requiresStaff"
                  {...register("requiresStaff")}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <label htmlFor="requiresStaff" className="text-sm">
                  Requer profissional
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── Photos (read-only for now) ─────────────────────────────── */}
        {isEditing && existing?.photos && existing.photos.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <SectionHeader title="Fotos" />
            <div className="flex flex-wrap gap-3">
              {existing.photos.map((url, i) => (
                <div
                  key={i}
                  className="relative h-24 w-24 overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <img
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Fotos gerenciadas via upload de imagens
            </p>
          </div>
        )}

        {/* ── Options ────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader title="Opcoes" />
            <button
              type="button"
              onClick={() => appendOption({ name: "", priceDeltaDisplay: "", active: true })}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus size={12} /> Adicionar
            </button>
          </div>

          {optionFields.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma opcao adicionada.</p>
          ) : (
            <div className="space-y-3">
              {optionFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <div className="flex-1 space-y-1">
                    <input
                      {...register(`options.${index}.name`)}
                      placeholder="Nome da opcao"
                      className={inputClass}
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <input
                      {...register(`options.${index}.priceDeltaDisplay`)}
                      placeholder="+ R$ 0,00"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      {...register(`options.${index}.active`)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Additionals ────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader title="Adicionais" />
            <button
              type="button"
              onClick={() => appendAdditional({ name: "", priceDisplay: "", active: true })}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus size={12} /> Adicionar
            </button>
          </div>

          {additionalFields.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum adicional cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {additionalFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <div className="flex-1 space-y-1">
                    <input
                      {...register(`additionals.${index}.name`)}
                      placeholder="Nome do adicional"
                      className={inputClass}
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <input
                      {...register(`additionals.${index}.priceDisplay`)}
                      placeholder="R$ 0,00"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      {...register(`additionals.${index}.active`)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditional(index)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => void navigate(listPath)}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Salvar Alteracoes"
                : `Criar ${resolvedTypeLabel}`}
          </button>
        </div>
      </form>
    </div>
  );
}
