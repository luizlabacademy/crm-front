import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useItem,
  useCreateItem,
  useUpdateItem,
} from "@/features/catalog/items/api/useItems";
import { useItemCategoriesCatalog } from "@/features/catalog/categories/api/useItemCategories";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  description: z.string().optional(),
  categoryId: z.coerce.number().nullable().optional(),
  priceDisplay: z
    .string()
    .min(1, "Preco obrigatorio")
    .refine((v) => {
      const n = parseFloat(v.replace(",", "."));
      return !isNaN(n) && n >= 0;
    }, "Preco invalido"),
  unit: z.string().optional(),
  sku: z.string().optional(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// ─── Field Error ──────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Helper: cents <-> display ────────────────────────────────────────────────

function centsToPriceDisplay(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function priceDisplayToCents(display: string): number {
  return Math.round(parseFloat(display.replace(",", ".")) * 100);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ItemFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const itemId = id ? Number(id) : null;

  const { data: existing, isLoading: isLoadingExisting } = useItem(itemId);
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const { data: categories = [] } = useItemCategoriesCatalog();

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
      description: "",
      categoryId: null,
      priceDisplay: "0,00",
      unit: "",
      sku: "",
      active: true,
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description ?? "",
        categoryId: existing.categoryId ?? null,
        priceDisplay: centsToPriceDisplay(existing.priceCents),
        unit: existing.unit ?? "",
        sku: existing.sku ?? "",
        active: existing.active,
      });
    }
  }, [existing, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const body = {
        tenantId: existing?.tenantId ?? 1,
        categoryId: values.categoryId ?? null,
        name: values.name,
        description: values.description ?? null,
        priceCents: priceDisplayToCents(values.priceDisplay),
        unit: values.unit || null,
        sku: values.sku || null,
        active: values.active,
      };

      if (isEditing && itemId !== null) {
        await updateMutation.mutateAsync({ id: itemId, body });
        toast.success("Item atualizado com sucesso.");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Item criado com sucesso.");
      }
      void navigate("/catalog/items");
    } catch {
      toast.error("Erro ao salvar item.");
    }
  }

  if (isEditing && isLoadingExisting) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void navigate("/catalog/items")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEditing ? "Editar Item" : "Novo Item"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEditing
              ? "Atualize as informacoes do item"
              : "Preencha os dados para criar um novo item"}
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className="space-y-5 rounded-xl border border-border bg-card p-6"
      >
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Nome <span className="text-destructive">*</span>
          </label>
          <input
            {...register("name")}
            placeholder="Ex: Cafe Expresso"
            className={cn(
              "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground",
              errors.name ? "border-destructive" : "border-input",
            )}
          />
          <FieldError message={errors.name?.message} />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Descricao
          </label>
          <textarea
            {...register("description")}
            placeholder="Descricao opcional..."
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground"
          />
        </div>

        {/* Price + Unit row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Preco (R$) <span className="text-destructive">*</span>
            </label>
            <input
              {...register("priceDisplay")}
              placeholder="0,00"
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground",
                errors.priceDisplay ? "border-destructive" : "border-input",
              )}
            />
            <FieldError message={errors.priceDisplay?.message} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Unidade
            </label>
            <input
              {...register("unit")}
              placeholder="Ex: un, kg, L"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category + SKU row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Categoria
            </label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 text-foreground"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">SKU</label>
            <input
              {...register("sku")}
              placeholder="Codigo interno"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="active"
            {...register("active")}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <label htmlFor="active" className="text-sm text-foreground">
            Ativo
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => void navigate("/catalog/items")}
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
                : "Criar Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
