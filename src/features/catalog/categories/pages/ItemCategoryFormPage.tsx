import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ItemCategoryForm } from "@/features/catalog/categories/components/ItemCategoryForm";
import {
  useItemCategory,
  useCreateItemCategory,
  usePatchItemCategory,
} from "@/features/catalog/categories/api/useItemCategories";
import type { ItemCategoryAvailableType } from "@/features/catalog/categories/types/itemCategoryTypes";

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

  async function onSubmit(values: {
    name: string;
    description?: string;
    showOnSite: boolean;
    active: boolean;
    availableTypes: ItemCategoryAvailableType[];
  }) {
    try {
      const body = {
        tenantId: existing?.tenantId ?? 1,
        name: values.name,
        description: values.description?.trim() || null,
        showOnSite: values.showOnSite,
        active: values.active,
        availableTypes: values.availableTypes,
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
    createMutation.isPending || updateMutation.isPending;

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

      <ItemCategoryForm
        mode={isEditing ? "edit" : "create"}
        existing={existing}
        onSubmit={onSubmit}
        isSubmitting={false}
        isSaving={isSaving}
        showPhotoUploader={true}
        hideTypesField={false}
        onCancel={() => void navigate("/catalog/categories")}
      />
    </div>
  );
}
