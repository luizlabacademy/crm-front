import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ChevronDown, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  useRole,
  useCreateRole,
  useUpdateRole,
  useAllPermissions,
  useRolePermissions,
  useUpdateRolePermissions,
} from "@/features/admin/roles/api/useRoles";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

function inputCls(hasError?: boolean) {
  return cn(
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none",
    "focus:ring-2 focus:ring-ring focus:ring-offset-1",
    "disabled:opacity-50",
    hasError ? "border-destructive" : "border-input",
  );
}

interface PermissionOption {
  id: number;
  code: string;
  description?: string | null;
}

interface PermissionMultiSelectProps {
  options: PermissionOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

function PermissionMultiSelect({
  options,
  selectedIds,
  onChange,
  disabled,
}: PermissionMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOptions = options.filter((option) =>
    selectedIds.includes(option.id),
  );
  const filteredOptions = options.filter((option) => {
    const notSelected = !selectedIds.includes(option.id);
    const matches = `${option.code} ${option.description ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return notSelected && matches;
  });

  function addPermission(id: number) {
    if (selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
    setSearch("");
  }

  function removePermission(id: number) {
    onChange(selectedIds.filter((item) => item !== id));
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "min-h-24 rounded-md border border-input bg-background px-2 py-2",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
          disabled && "opacity-50",
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2 py-0.5 text-sm text-blue-700"
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => removePermission(option.id)}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                aria-label={`Remover ${option.code}`}
              >
                <X size={12} />
              </button>
              <span>{option.code}</span>
            </span>
          ))}

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
              if (
                !e.currentTarget.parentElement?.parentElement?.contains(
                  e.relatedTarget as Node | null,
                )
              ) {
                setTimeout(() => setOpen(false), 120);
              }
            }}
            disabled={disabled}
            placeholder={
              selectedOptions.length === 0 ? "Buscar permissões..." : ""
            }
            className="min-w-36 flex-1 border-0 bg-transparent px-1 py-0.5 text-sm outline-none"
          />

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            disabled={disabled}
            className="ml-auto rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Abrir lista de permissões"
          >
            <ChevronDown
              size={14}
              className={cn("transition-transform", open && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-card p-1 shadow-lg">
          {filteredOptions.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">
              Nenhuma permissão disponível.
            </p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onMouseDown={() => addPermission(option.id)}
                className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
              >
                <span className="font-mono text-xs">{option.code}</span>
                {option.description && (
                  <span className="ml-1 text-muted-foreground">
                    - {option.description}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function RoleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const roleId = id ? parseInt(id, 10) : null;

  const {
    data: role,
    isLoading: isLoadingRole,
    isError: isRoleError,
  } = useRole(roleId);
  const { data: permissionsData, isLoading: isLoadingPermissions } =
    useAllPermissions();
  const { data: rolePermissions } = useRolePermissions(roleId);

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const updateRolePermissionsMutation = useUpdateRolePermissions();

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
    },
  });

  useEffect(() => {
    if (!role) return;
    reset({
      name: role.name,
      description: role.description ?? "",
      active: role.active,
    });
  }, [role, reset]);

  useEffect(() => {
    if (!isEdit) return;
    if (!rolePermissions) return;
    setSelectedPermissionIds(
      rolePermissions.map((permission) => permission.id),
    );
  }, [isEdit, rolePermissions]);

  const permissions = permissionsData?.content ?? [];

  async function onSubmit(values: FormValues) {
    try {
      const body = {
        name: values.name,
        description: values.description || null,
        active: values.active,
      };

      let targetRoleId: number;
      if (isEdit && roleId) {
        await updateMutation.mutateAsync({ id: roleId, body });
        targetRoleId = roleId;
      } else {
        const created = await createMutation.mutateAsync(body);
        targetRoleId = created.id;
      }

      try {
        await updateRolePermissionsMutation.mutateAsync({
          id: targetRoleId,
          body: { permissionIds: selectedPermissionIds },
        });
      } catch {
        toast.warning(
          "Perfil salvo, mas não foi possível sincronizar permissões.",
        );
        void navigate("/admin/roles");
        return;
      }

      toast.success("Perfil salvo com sucesso.");
      void navigate("/admin/roles");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          toast.error(
            "Dados inválidos. Verifique os campos e tente novamente.",
          );
        } else if (status === 404) {
          toast.error("Perfil não encontrado.");
        } else if (status === 409) {
          toast.error("Já existe um perfil com este nome.");
        } else {
          toast.error("Não foi possível salvar as permissões do perfil.");
        }
      } else {
        toast.error("Não foi possível salvar as permissões do perfil.");
      }
    }
  }

  if (isEdit && isLoadingRole) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isEdit && isRoleError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Perfil não encontrado.</p>
        <button
          type="button"
          onClick={() => void navigate("/admin/roles")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Voltar para listagem
        </button>
      </div>
    );
  }

  const isSaving =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    updateRolePermissionsMutation.isPending;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void navigate("/admin/roles")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">Cadastro de Perfil</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? "Altere os dados do perfil e as permissões vinculadas."
              : "Preencha os dados para criar um novo perfil e definir permissões."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name" required>
            Nome
          </Label>
          <input
            id="name"
            type="text"
            placeholder="Ex.: Gerente de Vendas"
            {...register("name")}
            disabled={isSaving}
            className={inputCls(Boolean(errors.name))}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição</Label>
          <textarea
            id="description"
            rows={3}
            placeholder="Descreva as responsabilidades deste perfil..."
            {...register("description")}
            disabled={isSaving}
            className={cn(inputCls(), "resize-none")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="permissions">Permissões</Label>
          <PermissionMultiSelect
            options={permissions}
            selectedIds={selectedPermissionIds}
            onChange={setSelectedPermissionIds}
            disabled={isSaving || isLoadingPermissions}
          />
          <p className="text-xs text-muted-foreground">
            Selecionadas: {selectedPermissionIds.length}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="active"
            type="checkbox"
            {...register("active")}
            disabled={isSaving}
            className="accent-primary h-4 w-4"
          />
          <label htmlFor="active" className="text-sm cursor-pointer">
            Perfil ativo
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border">
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
            onClick={() => void navigate("/admin/roles")}
            disabled={isSaving}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
