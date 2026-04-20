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
  usePatchItemCategory,
} from "@/features/catalog/categories/api/useItemCategories";
import type { ItemCategoryAvailableType } from "@/features/catalog/categories/types/itemCategoryTypes";
import { PhotoUploader } from "@/components/shared/PhotoUploader";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  description: z.string().optional(),
  showOnSite: z.boolean(),
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
  const updateMutation = usePatchItemCategory();

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
      showOnSite: false,
      availableTypes: ["PRODUCT", "SERVICE"],
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description ?? "",
        showOnSite: existing.showOnSite ?? false,
        availableTypes: existing.availableTypes ?? ["PRODUCT", "SERVICE"],
      });
    }
  }, [existing, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const body = {
        tenantId: existing?.tenantId ?? 1,
        name: values.name,
        description: values.description?.trim() || null,
        showOnSite: values.showOnSite,
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

  const isSaving =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  const subtitle = (existing?.availableTypes ?? [])
    .map((type) => (type === "PRODUCT" ? "Produto" : "Servico"))
    .join(" • ");

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

      {isEditing && categoryId && existing && (
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <PhotoUploader
            fileType="CATEGORY"
            tenantId={existing.tenantId}
            entityId={categoryId}
            fallbackUrl={existing.photo ?? null}
            disabled={isSaving}
            displayName={existing.name}
            subtitle={subtitle || null}
            shape="square"
          />
        </div>
      )}

      {!isEditing && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          Salve a categoria para habilitar o envio de foto.
        </div>
      )}

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
          <label className="text-sm font-medium text-foreground">Descricao</label>
          <textarea
            {...register("description")}
            placeholder="Descreva a categoria"
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground resize-none"
          />
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

        <div className="flex items-center gap-3">
          <input
            id="showOnSite"
            type="checkbox"
            {...register("showOnSite")}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <label htmlFor="showOnSite" className="text-sm text-foreground">
            Exibir no site/landing page
          </label>
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
            disabled={isSaving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving
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
