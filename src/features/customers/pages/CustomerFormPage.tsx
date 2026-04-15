import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
} from "@/features/customers/api/useCustomers";
import { useTenantsSelector } from "@/lib/api/useTenants";
import {
  Label,
  FieldError,
  inputCls,
  PersonTypeSwitch,
  PhysicalFields,
  LegalFields,
  ContactsField,
  AddressesField,
  type PersonType,
  type ContactRow,
  type AddressRow,
} from "@/components/shared/PersonFields";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Grid } from "@/components/shared/Grid";
import { Fieldset } from "@/components/shared/Fieldset";
import { Divider } from "@/components/shared/Divider";

// ─── Schema ───────────────────────────────────────────────────────────────────

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
  tenantId: z.coerce.number().min(1, "Tenant é obrigatório"),
  fullName: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  document: z.string().optional(),
  active: z.boolean(),
  notes: z.string().optional(),
  physical: physicalSchema.optional(),
  legal: legalSchema.optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CustomerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const customerId = id ? parseInt(id, 10) : null;

  const {
    data: customer,
    isLoading: isLoadingCustomer,
    isError: isCustomerError,
  } = useCustomer(customerId);
  const { data: tenantsData } = useTenantsSelector();

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const tenants = tenantsData?.content ?? [];

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
      tenantId: 0,
      fullName: "",
      email: "",
      phone: "",
      document: "",
      active: true,
      notes: "",
    },
  });

  // Populate form on edit
  useEffect(() => {
    if (!customer) return;

    if (customer.physical?.fullName || customer.physical?.cpf) {
      setPersonType("physical");
    } else if (customer.legal?.corporateName || customer.legal?.cnpj) {
      setPersonType("legal");
    } else {
      setPersonType("none");
    }

    if (customer.contacts?.length) {
      setContacts(
        customer.contacts.map((c) => ({
          type: c.type ?? "PHONE",
          contactValue: c.contactValue ?? "",
          primary: c.primary ?? false,
          active: c.active ?? true,
        })),
      );
    }

    if (customer.addresses?.length) {
      setAddresses(
        customer.addresses.map((a) => ({
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
      tenantId: customer.tenantId,
      fullName: customer.fullName ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      document: customer.document ?? "",
      active: customer.active,
      notes: customer.notes ?? "",
      physical: {
        fullName: customer.physical?.fullName ?? "",
        cpf: customer.physical?.cpf ?? "",
        birthDate: customer.physical?.birthDate ?? "",
      },
      legal: {
        corporateName: customer.legal?.corporateName ?? "",
        tradeName: customer.legal?.tradeName ?? "",
        cnpj: customer.legal?.cnpj ?? "",
      },
    });
  }, [customer, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const body = {
        tenantId: values.tenantId,
        fullName: values.fullName || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        document: values.document || undefined,
        active: values.active,
        notes: values.notes || undefined,
        physical: personType === "physical" ? values.physical : undefined,
        legal: personType === "legal" ? values.legal : undefined,
        contacts: contacts.length > 0 ? contacts : undefined,
        addresses: addresses.length > 0 ? addresses : undefined,
      };

      if (isEdit && customerId) {
        await updateMutation.mutateAsync({ id: customerId, body });
        toast.success("Cliente atualizado com sucesso.");
        void navigate(`/customers/${customerId}`);
      } else {
        const created = await createMutation.mutateAsync(body);
        toast.success("Cliente cadastrado com sucesso.");
        void navigate(`/customers/${created.id}`);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          toast.error(
            "Dados inválidos. Verifique os campos e tente novamente.",
          );
        } else if (status === 404) {
          toast.error("Cliente não encontrado.");
        } else {
          toast.error("Erro no servidor. Tente novamente.");
        }
      }
    }
  }

  if (isEdit && isLoadingCustomer) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isEdit && isCustomerError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Cliente não encontrado.</p>
        <button
          type="button"
          onClick={() => void navigate("/customers")}
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

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => void navigate("/customers")}
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Editar cliente" : "Novo cliente"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? "Altere os dados do cliente e salve."
              : "Preencha os dados para cadastrar um novo cliente."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* ── Dados básicos ── */}
        <Fieldset legend="Dados básicos" className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tenantId" required>
              Tenant
            </Label>
            <select
              id="tenantId"
              {...register("tenantId", { valueAsNumber: true })}
              disabled={isSaving}
              className={inputCls(Boolean(errors.tenantId))}
            >
              <option value={0}>Selecione um tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name ?? `Tenant #${t.id}`}
                </option>
              ))}
            </select>
            <FieldError message={errors.tenantId?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nome / Identificação</Label>
            <input
              id="fullName"
              type="text"
              placeholder="Nome do cliente"
              {...register("fullName")}
              disabled={isSaving}
              className={inputCls(Boolean(errors.fullName))}
            />
          </div>

          <Grid cols={1} gap={4} className="sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <input
                id="email"
                type="email"
                placeholder="cliente@exemplo.com"
                {...register("email")}
                disabled={isSaving}
                className={inputCls(Boolean(errors.email))}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <input
                id="phone"
                type="text"
                placeholder="(XX) XXXXX-XXXX"
                maxLength={15}
                {...register("phone")}
                disabled={isSaving}
                className={inputCls()}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="document">Documento (CPF / CNPJ)</Label>
              <input
                id="document"
                type="text"
                placeholder="000.000.000-00"
                maxLength={18}
                {...register("document")}
                disabled={isSaving}
                className={inputCls()}
              />
            </div>
          </Grid>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              rows={3}
              {...register("notes")}
              disabled={isSaving}
              className={cn(inputCls(), "resize-none")}
            />
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
              Cliente ativo
            </label>
          </div>
        </Fieldset>

        {/* ── Dados de pessoa ── */}
        <Fieldset legend="Dados de pessoa" className="space-y-4">
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
        </Fieldset>

        {/* ── Contatos ── */}
        <Fieldset legend="Contatos" className="space-y-4">
          <ContactsField
            contacts={contacts}
            onChange={setContacts}
            disabled={isSaving}
          />
        </Fieldset>

        {/* ── Endereços ── */}
        <Fieldset legend="Endereços" className="space-y-4">
          <AddressesField
            addresses={addresses}
            onChange={setAddresses}
            disabled={isSaving}
          />
        </Fieldset>

        {/* ── Actions ── */}
        <Divider />
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Salvar alterações" : "Cadastrar cliente"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigate("/customers")}
            disabled={isSaving}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
