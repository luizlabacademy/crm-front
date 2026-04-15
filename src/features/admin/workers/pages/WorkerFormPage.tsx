import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  useWorker,
  useCreateWorker,
  useUpdateWorker,
  useTenantsList,
} from "@/features/admin/workers/api/useWorkers";
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
  tenantId: z.coerce.number().min(1, "Tenant é obrigatório"),
  userId: z.coerce.number().optional().nullable(),
  active: z.boolean(),
  physical: physicalSchema.optional(),
  legal: legalSchema.optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function WorkerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const workerId = id ? parseInt(id, 10) : null;

  const { data: worker, isLoading, isError } = useWorker(workerId);
  const { data: tenantsData } = useTenantsList();

  const createMutation = useCreateWorker();
  const updateMutation = useUpdateWorker();

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
      userId: null,
      active: true,
    },
  });

  useEffect(() => {
    if (!worker) return;

    if (worker.physical?.fullName || worker.physical?.cpf) {
      setPersonType("physical");
    } else if (worker.legal?.corporateName || worker.legal?.cnpj) {
      setPersonType("legal");
    } else {
      setPersonType("none");
    }

    if (worker.contacts?.length) {
      setContacts(
        worker.contacts.map((c) => ({
          type: c.type ?? "PHONE",
          contactValue: c.contactValue ?? "",
          primary: c.primary ?? false,
          active: c.active ?? true,
        })),
      );
    }

    if (worker.addresses?.length) {
      setAddresses(
        worker.addresses.map((a) => ({
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
      tenantId: worker.tenantId,
      userId: worker.userId ?? null,
      active: worker.active,
      physical: {
        fullName: worker.physical?.fullName ?? "",
        cpf: worker.physical?.cpf ?? "",
        birthDate: worker.physical?.birthDate ?? "",
      },
      legal: {
        corporateName: worker.legal?.corporateName ?? "",
        tradeName: worker.legal?.tradeName ?? "",
        cnpj: worker.legal?.cnpj ?? "",
      },
    });
  }, [worker, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const body = {
        tenantId: values.tenantId,
        userId: values.userId ?? undefined,
        active: values.active,
        physical: personType === "physical" ? values.physical : undefined,
        legal: personType === "legal" ? values.legal : undefined,
        contacts: contacts.length > 0 ? contacts : undefined,
        addresses: addresses.length > 0 ? addresses : undefined,
      };

      if (isEdit && workerId) {
        await updateMutation.mutateAsync({ id: workerId, body });
        toast.success("Worker atualizado com sucesso.");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Worker cadastrado com sucesso.");
      }
      void navigate("/workers");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          toast.error("Dados inválidos. Verifique os campos.");
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
        <p className="text-sm text-destructive">Worker não encontrado.</p>
        <button
          type="button"
          onClick={() => void navigate("/workers")}
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

  const tenants = tenantsData?.content ?? [];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void navigate("/workers")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Editar worker" : "Novo worker"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? "Altere os dados do worker e salve."
              : "Preencha os dados para cadastrar um novo worker."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* ── Dados básicos ── */}
        <div className="space-y-4">
          <SectionTitle>Dados básicos</SectionTitle>

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
            <Label htmlFor="userId">ID de usuário vinculado</Label>
            <input
              id="userId"
              type="number"
              placeholder="ID do usuário (opcional)"
              {...register("userId", { valueAsNumber: true })}
              disabled={isSaving}
              className={inputCls()}
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Vincula este worker a uma conta de usuário existente.
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
              Worker ativo
            </label>
          </div>
        </div>

        {/* ── Dados de pessoa ── */}
        <div className="space-y-4">
          <SectionTitle>Dados de pessoa</SectionTitle>
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
            {isEdit ? "Salvar alterações" : "Cadastrar worker"}
          </button>
          <button
            type="button"
            onClick={() => void navigate("/workers")}
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
