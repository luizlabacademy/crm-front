import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  useUser,
  useCreateUser,
  useUpdateUser,
  useRolesCatalog,
  useUserRoles,
  useUpdateUserRoles,
  useChangeUserPassword,
} from "@/features/admin/users/api/useUsers";
import { useTenantsSelector } from "@/lib/api/useTenants";
import { ADMIN_SEED_EMAIL } from "@/features/admin/users/types/userTypes";
import {
  PersonTypeSwitch,
  PhysicalFields,
  LegalFields,
  ContactsField,
  AddressesField,
  Label,
  FieldError,
  inputCls,
} from "@/components/shared/PersonFields";
import type {
  PersonType,
  ContactRow,
  AddressRow,
} from "@/components/shared/PersonFields";
import { PhotoUploader } from "@/components/shared/PhotoUploader";
import { formatDateTime } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

const physicalSchema = z
  .object({
    fullName: z.string().optional().nullable(),
    cpf: z.string().optional().nullable(),
    birthDate: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

const legalSchema = z
  .object({
    corporateName: z.string().optional().nullable(),
    tradeName: z.string().optional().nullable(),
    cnpj: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

const formSchema = z.object({
  tenantId: z.coerce.number().min(1, "Tenant é obrigatório"),
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  active: z.boolean(),
  physical: physicalSchema,
  legal: legalSchema,
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z
      .string()
      .min(8, "Nova senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

function RoleMultiSelect({
  options,
  selectedIds,
  onChange,
  disabled,
}: {
  options: Array<{ id: number; name: string }>;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.filter((item) => selectedIds.includes(item.id));
  const available = options.filter(
    (item) =>
      !selectedIds.includes(item.id) &&
      item.name.toLowerCase().includes(search.toLowerCase()),
  );

  function add(id: number) {
    if (selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
    setSearch("");
  }

  function remove(id: number) {
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
          {selected.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2 py-0.5 text-sm text-blue-700"
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => remove(item.id)}
                className="text-blue-500 hover:text-blue-700"
                aria-label={`Remover ${item.name}`}
              >
                <X size={12} />
              </button>
              <span>{item.name}</span>
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
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            disabled={disabled}
            placeholder={selected.length === 0 ? "Buscar perfis..." : ""}
            className="min-w-36 flex-1 border-0 bg-transparent px-1 py-0.5 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            disabled={disabled}
            className="ml-auto rounded p-1 text-muted-foreground hover:bg-accent"
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
          {available.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">
              Nenhum perfil disponível.
            </p>
          ) : (
            available.map((item) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={() => add(item.id)}
                className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                {item.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ChangePasswordModal({
  userId,
  onClose,
}: {
  userId: number;
  onClose: () => void;
}) {
  const mutation = useChangeUserPassword();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: PasswordValues) {
    try {
      await mutation.mutateAsync({ id: userId, body: values });
      toast.success("Senha alterada com sucesso.");
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          toast.error("Dados de senha inválidos.");
        } else if (err.response?.status === 401) {
          toast.error("Senha atual incorreta.");
        } else {
          toast.error("Erro no servidor. Tente novamente em instantes.");
        }
      }
    }
  }

  const saving = isSubmitting || mutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">Alterar Senha</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 p-5"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" required>
              Senha Atual
            </Label>
            <input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              className={inputCls(Boolean(errors.currentPassword))}
            />
            <FieldError message={errors.currentPassword?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" required>
              Nova Senha
            </Label>
            <input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              className={inputCls(Boolean(errors.newPassword))}
            />
            <FieldError message={errors.newPassword?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" required>
              Confirmar Senha
            </Label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className={inputCls(Boolean(errors.confirmPassword))}
            />
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Salvar Senha
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const userId = id ? parseInt(id, 10) : null;

  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useUser(userId);
  const { data: userRolesData } = useUserRoles(userId);
  const { data: tenantsData } = useTenantsSelector();
  const { data: rolesData } = useRolesCatalog();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const updateRolesMutation = useUpdateUserRoles();

  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [personType, setPersonType] = useState<PersonType>("none");
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantId: 0,
      email: "",
      active: true,
      physical: null,
      legal: null,
    },
  });

  const tenantIdValue = watch("tenantId");

  useEffect(() => {
    if (!user) return;
    reset({
      tenantId: user.tenantId,
      email: user.email,
      active: user.active,
      physical: user.physical ?? null,
      legal: user.legal ?? null,
    });
    if (user.physical?.fullName || user.physical?.cpf) {
      setPersonType("physical");
    } else if (user.legal?.corporateName || user.legal?.cnpj) {
      setPersonType("legal");
    } else {
      setPersonType("none");
    }
    setContacts(
      (user.contacts ?? []).map((c) => ({
        type: c.type ?? "PHONE",
        contactValue: c.contactValue ?? "",
        primary: c.primary ?? false,
        active: c.active ?? true,
      })),
    );
    setAddresses(
      (user.addresses ?? []).map((a) => ({
        type: (a.type as "RESIDENTIAL" | "COMMERCIAL") ?? "RESIDENTIAL",
        street: a.street ?? "",
        number: a.number ?? "",
        complement: a.complement ?? "",
        neighborhood: a.neighborhood ?? "",
        postalCode: a.postalCode ?? "",
        primary: a.primary ?? false,
        active: a.active ?? true,
      })),
    );
  }, [user, reset]);

  useEffect(() => {
    if (!isEdit) return;
    if (userRolesData) {
      setSelectedRoleIds(userRolesData);
      return;
    }
    if (user?.roles && user.roles.length > 0) {
      setSelectedRoleIds(user.roles.map((role) => role.id));
      return;
    }
    if (user?.role?.id != null) {
      setSelectedRoleIds([user.role.id]);
      return;
    }
    if (user?.roleId != null) {
      setSelectedRoleIds([user.roleId]);
    }
  }, [isEdit, user, userRolesData]);

  // suppress unused warning — tenantIdValue is kept for future use
  void tenantIdValue;

  const roles = useMemo(
    () =>
      (rolesData?.content ?? []).map((role) => ({
        id: role.id,
        name: role.name,
      })),
    [rolesData],
  );

  async function onSubmit(values: FormValues) {
    try {
      const body = {
        tenantId: values.tenantId,
        email: values.email,
        active: values.active,
        passwordHash: "",
        physical: personType === "physical" ? (values.physical ?? null) : null,
        legal: personType === "legal" ? (values.legal ?? null) : null,
        contacts: contacts.map((c) => ({
          type: c.type,
          contactValue: c.contactValue,
          primary: c.primary,
          active: c.active,
        })),
        addresses: addresses.map((a) => ({
          type: a.type,
          street: a.street,
          number: a.number,
          complement: a.complement,
          neighborhood: a.neighborhood,
          postalCode: a.postalCode,
          primary: a.primary,
          active: a.active,
        })),
      };

      let targetId: number;
      if (isEdit && userId) {
        await updateMutation.mutateAsync({ id: userId, body });
        targetId = userId;
      } else {
        const created = await createMutation.mutateAsync(body);
        targetId = created.id;
      }

      await updateRolesMutation.mutateAsync({
        id: targetId,
        roleIds: selectedRoleIds,
      });

      toast.success("Usuário salvo com sucesso.");
      void navigate("/users");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          toast.error("Dados inválidos. Verifique os campos.");
        } else if (err.response?.status === 409) {
          toast.error("E-mail já cadastrado no sistema.");
        } else {
          toast.error("Erro no servidor. Tente novamente em instantes.");
        }
      }
    }
  }

  if (isEdit && isLoadingUser) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isEdit && isUserError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Usuário não encontrado.</p>
        <button
          type="button"
          onClick={() => void navigate("/users")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Voltar para listagem
        </button>
      </div>
    );
  }

  const isAdmin = isEdit && user?.email === ADMIN_SEED_EMAIL;
  const saving =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    updateRolesMutation.isPending;

  const displayName =
    user?.physical?.fullName ||
    user?.legal?.tradeName ||
    user?.legal?.corporateName ||
    user?.email ||
    "Novo usuario";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void navigate("/users")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Editar usuario" : "Novo usuario"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Preencha os dados do usuario e os perfis vinculados.
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Este e o usuario administrador do sistema. Alteracoes devem ser feitas
          com cuidado.
        </div>
      )}

      {isEdit && userId && user && (
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <PhotoUploader
            fileType="USER"
            tenantId={user.tenantId}
            entityId={userId}
            fallbackUrl={user.photo ?? null}
            disabled={saving}
            displayName={displayName}
            subtitle={user.email}
          />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <SectionCard
          title="Dados basicos"
          description="Informacoes de acesso e vinculo do usuario."
        >
          <div className="space-y-1.5">
            <Label htmlFor="tenantId" required>
              Tenant
            </Label>
            <select
              id="tenantId"
              {...register("tenantId", { valueAsNumber: true })}
              disabled={saving}
              className={inputCls(Boolean(errors.tenantId))}
            >
              <option value={0}>Selecione um tenant</option>
              {(tenantsData?.content ?? []).map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.tenantId?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" required>
              E-mail
            </Label>
            <input
              id="email"
              type="email"
              {...register("email")}
              disabled={saving}
              className={inputCls(Boolean(errors.email))}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="active"
              type="checkbox"
              {...register("active")}
              disabled={saving}
              className="accent-primary h-4 w-4"
            />
            <label htmlFor="active" className="text-sm">
              Usuario ativo
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Dados de pessoa">
          <PersonTypeSwitch
            value={personType}
            onChange={setPersonType}
            disabled={saving}
          />
          {personType === "physical" && (
            <PhysicalFields
              register={register}
              errors={errors}
              disabled={saving}
            />
          )}
          {personType === "legal" && (
            <LegalFields
              register={register}
              errors={errors}
              disabled={saving}
            />
          )}
        </SectionCard>

        <SectionCard title="Contatos">
          <ContactsField
            contacts={contacts}
            onChange={setContacts}
            disabled={saving}
          />
        </SectionCard>

        <SectionCard title="Enderecos">
          <AddressesField
            addresses={addresses}
            onChange={setAddresses}
            disabled={saving}
          />
        </SectionCard>

        <SectionCard
          title="Perfis de acesso"
          description="Defina os perfis vinculados ao usuario."
        >
          <RoleMultiSelect
            options={roles}
            selectedIds={selectedRoleIds}
            onChange={setSelectedRoleIds}
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Selecionados: {selectedRoleIds.length}
          </p>
        </SectionCard>

        {isEdit && userId != null && (
          <SectionCard title="Seguranca">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              disabled={saving}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              Alterar senha
            </button>
          </SectionCard>
        )}

        {isEdit && user && (
          <SectionCard title="Metadados">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="createdAt">Criado em</Label>
                <input
                  id="createdAt"
                  readOnly
                  value={formatDateTime(user.createdAt)}
                  className={cn(inputCls(), "bg-muted/40")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="updatedAt">Alterado em</Label>
                <input
                  id="updatedAt"
                  readOnly
                  value={user.updatedAt ? formatDateTime(user.updatedAt) : "—"}
                  className={cn(inputCls(), "bg-muted/40")}
                />
              </div>
            </div>
          </SectionCard>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Salvar
          </button>
          <button
            type="button"
            onClick={() => void navigate("/users")}
            disabled={saving}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>

      {passwordModalOpen && userId != null && (
        <ChangePasswordModal
          userId={userId}
          onClose={() => setPasswordModalOpen(false)}
        />
      )}
    </div>
  );
}
