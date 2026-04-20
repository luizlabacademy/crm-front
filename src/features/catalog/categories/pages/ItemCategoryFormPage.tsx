import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useItemCategory,
  useCreateItemCategory,
  useUpdateItemCategory,
} from "@/features/catalog/categories/api/useItemCategories";
import type { ItemCategoryAvailableType } from "@/features/catalog/categories/types/itemCategoryTypes";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  availableTypes: z
    .array(z.enum(["PRODUCT", "SERVICE"]))
    .min(1, "Selecione pelo menos um tipo"),
});

type FormValues = z.infer<typeof schema>;

// ─── Field Error ──────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ItemCategoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const categoryId = id ? Number(id) : null;

  const { data: existing, isLoading: isLoadingExisting } =
    useItemCategory(categoryId);
  const createMutation = useCreateItemCategory();
  const updateMutation = useUpdateItemCategory();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", availableTypes: ["PRODUCT", "SERVICE"] },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        availableTypes: existing.availableTypes ?? ["PRODUCT", "SERVICE"],
      });
    }
  }, [existing, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const body = {
        tenantId: existing?.tenantId ?? 1,
        name: values.name,
        availableTypes: values.availableTypes as ItemCategoryAvailableType[],
      };

      if (isEditing && categoryId !== null) {
        await updateMutation.mutateAsync({ id: categoryId, body });
        toast.success("Categoria atualizada com sucesso.");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Categoria criada com sucesso.");
      }
      void navigate("/catalog/categories");
    } catch {
      toast.error("Erro ao salvar categoria.");
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
          onClick={() => void navigate("/catalog/categories")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEditing ? "Editar Categoria" : "Nova Categoria"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEditing
              ? "Atualize as informacoes da categoria"
              : "Preencha os dados para criar uma nova categoria"}
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className="space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Nome <span className="text-destructive">*</span>
          </label>
          <input
            {...register("name")}
            placeholder="Ex: Bebidas"
            className={cn(
              "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground",
              errors.name ? "border-destructive" : "border-input",
            )}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Tipos aceitos <span className="text-destructive">*</span>
          </label>
          <Controller
            name="availableTypes"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value.includes("PRODUCT")}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...field.value, "PRODUCT" as const]
                        : field.value.filter((t) => t !== "PRODUCT");
                      field.onChange(next);
                    }}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  Produto
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value.includes("SERVICE")}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...field.value, "SERVICE" as const]
                        : field.value.filter((t) => t !== "SERVICE");
                      field.onChange(next);
                    }}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  Servico
                </label>
              </div>
            )}
          />
          <FieldError message={errors.availableTypes?.message} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => void navigate("/catalog/categories")}
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
                : "Criar Categoria"}
          </button>
        </div>
      </form>
    </div>
  );
}
