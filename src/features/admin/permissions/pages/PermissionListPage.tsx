import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  usePermissions,
  usePermission,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from "@/features/admin/permissions/api/usePermissions";
import type { PermissionResponse } from "@/features/admin/permissions/types/permissionTypes";
import { formatDateTime } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils";
import { SkeletonRow } from "@/components/shared/SkeletonRow";
import { ActiveBadge } from "@/components/shared/ActiveBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  code: z
    .string()
    .min(1, "Código é obrigatório")
    .regex(
      /^[A-Z0-9_]+$/,
      "Somente letras maiúsculas, números e underscores (ex.: CUSTOMER_READ)",
    ),
  description: z.string().optional(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Permission Form Modal ────────────────────────────────────────────────────

interface PermissionFormModalProps {
  editId: number | null;
  onClose: () => void;
}

function PermissionFormModal({ editId, onClose }: PermissionFormModalProps) {
  const isEdit = editId !== null;
  const { data: permission, isLoading: isLoadingPermission } =
    usePermission(editId);

  const createMutation = useCreatePermission();
  const updateMutation = useUpdatePermission();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      description: "",
      active: true,
    },
  });

  // Populate form on edit
  useEffect(() => {
    if (!permission) return;
    reset({
      code: permission.code,
      description: permission.description ?? "",
      active: permission.active,
    });
  }, [permission, reset]);

  // Auto-uppercase code field
  const codeValue = watch("code");
  useEffect(() => {
    if (codeValue !== codeValue.toUpperCase()) {
      setValue("code", codeValue.toUpperCase(), { shouldValidate: true });
    }
  }, [codeValue, setValue]);

  async function onSubmit(values: FormValues) {
    try {
      const body = {
        code: values.code,
        description: values.description || null,
        active: values.active,
      };

      if (isEdit && editId != null) {
        await updateMutation.mutateAsync({ id: editId, body });
        toast.success("Permissão salva com sucesso.");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Permissão criada com sucesso.");
      }
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          toast.error(
            "Dados inválidos. Verifique os campos e tente novamente.",
          );
        } else if (status === 409) {
          toast.error("Já existe uma permissão com este código.");
        }
      }
    }
  }

  const isSaving =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  function inputCls(hasError?: boolean) {
    return cn(
      "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none",
      "focus:ring-2 focus:ring-ring focus:ring-offset-1",
      "disabled:opacity-50",
      hasError ? "border-destructive" : "border-input",
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-lg">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">Cadastro de Permissão</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Fechar"
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        {isEdit && isLoadingPermission ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 p-5"
            noValidate
          >
            {/* Code */}
            <div className="space-y-1.5">
              <label htmlFor="code" className="block text-sm font-medium">
                Código <span className="text-destructive">*</span>
              </label>
              <input
                id="code"
                type="text"
                placeholder="Ex.: CUSTOMER_READ"
                {...register("code")}
                disabled={isSaving}
                className={cn(inputCls(Boolean(errors.code)), "font-mono")}
              />
              {errors.code && (
                <p className="text-xs text-destructive">
                  {errors.code.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Convenção: RECURSO_AÇÃO em maiúsculas (ex.: CUSTOMER_READ,
                ORDER_DELETE)
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="block text-sm font-medium"
              >
                Descrição
              </label>
              <textarea
                id="description"
                rows={2}
                placeholder="Descreva o que esta permissão permite..."
                {...register("description")}
                disabled={isSaving}
                className={cn(inputCls(), "resize-none")}
              />
            </div>

            {/* Active */}
            <div className="flex items-center gap-3">
              <input
                id="perm-active"
                type="checkbox"
                {...register("active")}
                disabled={isSaving}
                className="accent-primary h-4 w-4"
              />
              <label htmlFor="perm-active" className="text-sm cursor-pointer">
                Permissão ativa
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving && <Loader2 size={14} className="animate-spin" />}
                Salvar
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PermissionListPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    code: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = usePermissions({
    page,
    size: 20,
  });
  const deleteMutation = useDeletePermission();

  const permissions = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  function openCreate() {
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(permission: PermissionResponse) {
    setEditId(permission.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditId(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Permissão excluída com sucesso.");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.error("Permissão não encontrada.");
      } else {
        toast.error("Erro ao excluir. Tente novamente.");
      }
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Permissões</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Carregando..."
              : `${totalElements} permissão${totalElements !== 1 ? "ões" : ""} cadastrada${totalElements !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void navigate("/admin/roles")}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            Perfis
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Nova permissão
          </button>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>Erro ao carregar permissões. Verifique sua conexão.</span>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-1.5 underline underline-offset-2 hover:no-underline"
          >
            <RefreshCw size={12} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground bg-muted/40">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Criado em</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={6} />
                ))
              ) : permissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Lock size={32} className="text-muted-foreground/50" />
                      <p>Nenhuma permissão encontrada.</p>
                      <button
                        type="button"
                        onClick={openCreate}
                        className="mt-1 text-sm text-primary hover:underline"
                      >
                        Criar permissão
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                permissions.map((permission) => (
                  <tr
                    key={permission.id}
                    className="hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => openEdit(permission)}
                  >
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {permission.id}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-xs">
                      {permission.code}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[300px] truncate">
                      {permission.description ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDateTime(permission.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={permission.active} />
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="Editar permissão"
                          onClick={() => openEdit(permission)}
                          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          aria-label="Excluir permissão"
                          onClick={() =>
                            setDeleteTarget({
                              id: permission.id,
                              code: permission.code,
                            })
                          }
                          className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </div>

      {/* Permission form modal */}
      {modalOpen && (
        <PermissionFormModal editId={editId} onClose={closeModal} />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          description={
            <>
              Deseja excluir a permissão{" "}
              <span className="font-mono font-medium">{deleteTarget.code}</span>
              ? Esta ação não pode ser desfeita.
            </>
          }
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
