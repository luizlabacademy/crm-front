import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  useTenant,
  useCreateTenant,
  useUpdateTenant,
  useTenants,
} from "@/features/admin/tenants/api/useTenants";
import {
  Label,
  FieldError,
  inputCls,
  SectionTitle,
  PersonTypeSwitch,
  PhysicalFields,
  LegalFields,
  ContactsField,
  AddressesField,
  type PersonType,
  type ContactRow,
  type AddressRow,
} from "@/components/shared/PersonFields";

const physicalSchema = z.object({
  fullName: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
});

const legalSchema = z.object({
  corporateName: z.string().optional(),
  tradeName: z.string().optional(),
  cnpj: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.string().optional(),
  parentTenantId: z.coerce.number().optional().nullable(),
  active: z.boolean(),
  physical: physicalSchema.optional(),
  legal: legalSchema.optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function TenantFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const tenantId = id ? parseInt(id, 10) : null;

  const { data: tenant, isLoading, isError } = useTenant(tenantId);
  const { data: tenantsData } = useTenants({ size: 100 });

  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant();

  const [personType, setPersonType] = useState<PersonType>("none");
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      parentTenantId: null,
      active: true,
    },
  });

  useEffect(() => {
    if (!tenant) return;

    if (tenant.physical?.fullName || tenant.physical?.cpf) {
      setPersonType("physical");
    } else if (tenant.legal?.corporateName || tenant.legal?.cnpj) {
      setPersonType("legal");
    } else {
      setPersonType("none");
    }

    if (tenant.contacts?.length) {
      setContacts(
        tenant.contacts.map((c) => ({
          type: c.type ?? "PHONE",
          contactValue: c.contactValue ?? "",
          primary: c.primary ?? false,
          active: c.active ?? true,
        })),
      );
    }

    if (tenant.addresses?.length) {
      setAddresses(
        tenant.addresses.map((a) => ({
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
    }

    reset({
      name: tenant.name ?? "",
      category: tenant.category ?? "",
      parentTenantId: tenant.parentTenantId ?? null,
      active: tenant.active,
      physical: {
        fullName: tenant.physical?.fullName ?? "",
        cpf: tenant.physical?.cpf ?? "",
        birthDate: tenant.physical?.birthDate ?? "",
      },
      legal: {
        corporateName: tenant.legal?.corporateName ?? "",
        tradeName: tenant.legal?.tradeName ?? "",
        cnpj: tenant.legal?.cnpj ?? "",
      },
    });
  }, [tenant, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const body = {
        name: values.name,
        category: values.category || undefined,
        parentTenantId: values.parentTenantId ?? undefined,
        active: values.active,
        physical: personType === "physical" ? values.physical : undefined,
        legal: personType === "legal" ? values.legal : undefined,
        contacts: contacts.length > 0 ? contacts : undefined,
        addresses: addresses.length > 0 ? addresses : undefined,
      };

      if (isEdit && tenantId) {
        await updateMutation.mutateAsync({ id: tenantId, body });
        toast.success("Tenant atualizado com sucesso.");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Tenant cadastrado com sucesso.");
      }
      void navigate("/tenants");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          toast.error("Dados inválidos. Verifique os campos.");
        } else if (status === 409) {
          toast.error("Já existe um tenant com este nome.");
        } else {
          toast.error("Erro no servidor. Tente novamente.");
        }
      }
    }
  }

  if (isEdit && isLoading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isEdit && isError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Tenant não encontrado.</p>
        <button
          type="button"
          onClick={() => void navigate("/tenants")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Voltar para listagem
        </button>
      </div>
    );
  }

  const isSaving =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  // Filter out the current tenant from parent selector to avoid self-reference
  const parentOptions = (tenantsData?.content ?? []).filter(
    (t) => t.id !== tenantId,
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void navigate("/tenants")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Editar tenant" : "Novo tenant"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? "Altere os dados do tenant e salve."
              : "Preencha os dados para cadastrar um novo tenant."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* ── Dados básicos ── */}
        <div className="space-y-4">
          <SectionTitle>Dados básicos</SectionTitle>

          <div className="space-y-1.5">
            <Label htmlFor="name" required>
              Nome
            </Label>
            <input
              id="name"
              type="text"
              {...register("name")}
              disabled={isSaving}
              className={inputCls(Boolean(errors.name))}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Categoria</Label>
              <input
                id="category"
                type="text"
                placeholder="Ex: Matriz, Filial, Parceiro..."
                {...register("category")}
                disabled={isSaving}
                className={inputCls()}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parentTenantId">Tenant pai</Label>
              <select
                id="parentTenantId"
                {...register("parentTenantId", { valueAsNumber: true })}
                disabled={isSaving}
                className={inputCls()}
              >
                <option value="">Nenhum (raiz)</option>
                {parentOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name ?? `Tenant #${t.id}`}
                  </option>
                ))}
              </select>
            </div>
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
              Tenant ativo
            </label>
          </div>
        </div>

        {/* ── Dados de pessoa ── */}
        <div className="space-y-4">
          <SectionTitle>Dados de pessoa jurídica / física</SectionTitle>
          <PersonTypeSwitch
            value={personType}
            onChange={setPersonType}
            disabled={isSaving}
          />
          {personType === "physical" && (
            <PhysicalFields
              register={register}
              errors={errors}
              disabled={isSaving}
            />
          )}
          {personType === "legal" && (
            <LegalFields
              register={register}
              errors={errors}
              disabled={isSaving}
            />
          )}
        </div>

        {/* ── Contatos ── */}
        <div className="space-y-4">
          <SectionTitle>Contatos</SectionTitle>
          <ContactsField
            contacts={contacts}
            onChange={setContacts}
            disabled={isSaving}
          />
        </div>

        {/* ── Endereços ── */}
        <div className="space-y-4">
          <SectionTitle>Endereços</SectionTitle>
          <AddressesField
            addresses={addresses}
            onChange={setAddresses}
            disabled={isSaving}
          />
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Salvar alterações" : "Cadastrar tenant"}
          </button>
          <button
            type="button"
            onClick={() => void navigate("/tenants")}
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
