import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { PhotoUploader } from "@/components/shared/PhotoUploader";
import type { ItemCategoryAvailableType, ItemCategoryResponse } from "@/features/catalog/categories/types/itemCategoryTypes";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  description: z.string().optional(),
  showOnSite: z.boolean(),
  active: z.boolean(),
  availableTypes: z
    .array(z.enum(["PRODUCT", "SERVICE"]))
    .min(1, "Selecione pelo menos um tipo"),
});

type FormValues = z.infer<typeof schema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ItemCategoryFormProps {
  mode: "create" | "edit";
  existing?: ItemCategoryResponse | null;
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting: boolean;
  isSaving: boolean;
  showPhotoUploader?: boolean;
  hideTypesField?: boolean;
  forceTypes?: ItemCategoryAvailableType[];
  onCancel?: () => void;
}

// ─── Field Error ──────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ItemCategoryForm({
  mode,
  existing,
  onSubmit,
  isSubmitting,
  isSaving,
  showPhotoUploader = true,
  hideTypesField = false,
  forceTypes = [],
  onCancel,
}: ItemCategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      showOnSite: false,
      active: true,
      availableTypes: ["PRODUCT", "SERVICE"],
    },
  });

  const activeValue = watch("active");
  const nameValue = watch("name");
  const availableTypesValue = watch("availableTypes");

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description ?? "",
        showOnSite: existing.showOnSite ?? false,
        active: existing.active ?? true,
        availableTypes: existing.availableTypes ?? ["PRODUCT", "SERVICE"],
      });
    }
  }, [existing, reset]);

  useEffect(() => {
    if (!activeValue) {
      setValue("showOnSite", false);
    }
  }, [activeValue, setValue]);

  // Keep forced types in sync when hideTypesField is true
  useEffect(() => {
    if (hideTypesField && forceTypes.length > 0) {
      // Ensure forced types are included
      const merged = Array.from(
        new Set<ItemCategoryAvailableType>([
          ...availableTypesValue,
          ...forceTypes,
        ]),
      );
      if (JSON.stringify(merged.sort()) !== JSON.stringify(availableTypesValue.sort())) {
        setValue("availableTypes", merged);
      }
    }
  }, [hideTypesField, forceTypes, availableTypesValue, setValue]);

  async function handleFormSubmit(values: FormValues) {
    // Ensure forced types are included
    let finalTypes = [...values.availableTypes];
    if (forceTypes.length > 0) {
      finalTypes = Array.from(
        new Set<ItemCategoryAvailableType>([
          ...finalTypes,
          ...forceTypes,
        ]),
      );
    }
    await onSubmit({ ...values, availableTypes: finalTypes });
  }

  return (
    <div className="space-y-4">
      {showPhotoUploader && mode === "edit" && existing && (
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <PhotoUploader
            fileType="CATEGORY"
            tenantId={existing.tenantId}
            entityId={existing.id}
            fallbackUrl={existing.photo ?? null}
            disabled={isSaving}
            displayName={nameValue || existing.name}
            subtitle={null}
            shape="square"
          />
        </div>
      )}

      {showPhotoUploader && mode === "create" && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          Salve a categoria para habilitar o envio de foto.
        </div>
      )}

      <form
        onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
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

        {!hideTypesField && (
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
        )}

        <div className="rounded-md bg-muted/40 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <label className="flex items-center gap-3">
              <input
                id="active"
                type="checkbox"
                {...register("active")}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span className="text-sm text-foreground">Ativo</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                id="showOnSite"
                type="checkbox"
                {...register("showOnSite")}
                disabled={!activeValue}
                className="h-4 w-4 rounded border-input accent-primary disabled:opacity-50"
              />
              <span
                className={cn("text-sm", activeValue ? "text-foreground" : "text-muted-foreground")}
              >
                Exibir no site/landing page
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving || isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving || isSubmitting
              ? "Salvando..."
              : mode === "edit"
                ? "Salvar Alteracoes"
                : "Criar Categoria"}
          </button>
        </div>
      </form>
    </div>
  );
}
