import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  usePerson,
  useCreatePerson,
  useUpdatePerson,
} from "@/features/persons/api/usePersons";
import { useTenants } from "@/features/customers/api/useCustomers";
import { cn } from "@/lib/utils";

// ─── Zod schema ───────────────────────────────────────────────────────────────

const contactSchema = z.object({
  type: z.string().min(1, "Tipo é obrigatório"),
  value: z.string().min(1, "Valor é obrigatório"),
  primary: z.boolean(),
  active: z.boolean(),
});

const physicalSchema = z.object({
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
});

const legalSchema = z.object({
  corporateName: z.string().min(1, "Razão social é obrigatória"),
  tradeName: z.string().optional(),
  cnpj: z.string().optional(),
});

const formSchema = z.discriminatedUnion("personType", [
  z.object({
    personType: z.literal("physical"),
    tenantId: z.coerce.number().min(1, "Tenant é obrigatório"),
    active: z.boolean(),
    physical: physicalSchema,
    contacts: z.array(contactSchema),
  }),
  z.object({
    personType: z.literal("legal"),
    tenantId: z.coerce.number().min(1, "Tenant é obrigatório"),
    active: z.boolean(),
    legal: legalSchema,
    contacts: z.array(contactSchema),
  }),
]);

type FormValues = z.infer<typeof formSchema>;

// ─── Contact type options ─────────────────────────────────────────────────────

const CONTACT_TYPES = [
  { value: "EMAIL", label: "E-mail" },
  { value: "PHONE", label: "Telefone" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "OTHER", label: "Outro" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripMask(value: string): string {
  return value.replace(/\D/g, "");
}

function applyTenantId(fields: Record<string, unknown>) {
  return fields;
}

void applyTenantId; // suppress unused warning

// ─── Form field wrapper ───────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PersonFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const personId = id ? parseInt(id, 10) : null;

  const {
    data: person,
    isLoading: isLoadingPerson,
    isError: isPersonError,
  } = usePerson(personId);
  const { data: tenantsData } = useTenants();

  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();

  const tenants = tenantsData?.content ?? [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personType: "physical",
      tenantId: 0,
      active: true,
      physical: { fullName: "", cpf: "", birthDate: "" },
      contacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const personType = watch("personType");

  // Populate form on edit
  useEffect(() => {
    if (!person) return;
    const type = person.legal ? "legal" : "physical";
    if (type === "physical") {
      reset({
        personType: "physical",
        tenantId: person.tenantId,
        active: person.active,
        physical: {
          fullName: person.physical?.fullName ?? "",
          cpf: person.physical?.cpf ?? "",
          birthDate: person.physical?.birthDate ?? "",
        },
        contacts: (person.contacts ?? []).map((c) => ({
          type: c.type,
          value: c.value,
          primary: c.primary,
          active: c.active,
        })),
      });
    } else {
      reset({
        personType: "legal",
        tenantId: person.tenantId,
        active: person.active,
        legal: {
          corporateName: person.legal?.corporateName ?? "",
          tradeName: person.legal?.tradeName ?? "",
          cnpj: person.legal?.cnpj ?? "",
        },
        contacts: (person.contacts ?? []).map((c) => ({
          type: c.type,
          value: c.value,
          primary: c.primary,
          active: c.active,
        })),
      });
    }
  }, [person, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const body =
        values.personType === "physical"
          ? {
              tenantId: values.tenantId,
              active: values.active,
              physical: {
                fullName: values.physical.fullName,
                cpf: values.physical.cpf
                  ? stripMask(values.physical.cpf)
                  : null,
                birthDate: values.physical.birthDate || null,
              },
              legal: null,
              contacts: values.contacts,
            }
          : {
              tenantId: values.tenantId,
              active: values.active,
              physical: null,
              legal: {
                corporateName: values.legal.corporateName,
                tradeName: values.legal.tradeName || null,
                cnpj: values.legal.cnpj ? stripMask(values.legal.cnpj) : null,
              },
              contacts: values.contacts,
            };

      if (isEdit && personId) {
        await updateMutation.mutateAsync({ id: personId, body });
        toast.success("Pessoa atualizada com sucesso.");
      } else {
        const created = await createMutation.mutateAsync(body);
        toast.success("Pessoa cadastrada com sucesso.");
        void navigate(`/persons/${created.id}/edit`);
        return;
      }
      void navigate("/persons");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          toast.error(
            "Dados inválidos. Verifique os campos e tente novamente.",
          );
        } else if (status === 404) {
          toast.error("Pessoa não encontrada.");
        }
      }
    }
  }

  // Loading skeleton (edit mode)
  if (isEdit && isLoadingPerson) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  // Error loading person
  if (isEdit && isPersonError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Pessoa não encontrada.</p>
        <button
          type="button"
          onClick={() => void navigate("/persons")}
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
        <button
          type="button"
          onClick={() => void navigate("/persons")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Editar pessoa" : "Nova pessoa"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? "Altere os dados da pessoa e salve."
              : "Preencha os dados para cadastrar uma nova pessoa."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Tenant */}
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
                {t.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.tenantId?.message} />
        </div>

        {/* Tipo */}
        <div className="space-y-2">
          <Label htmlFor="personType" required>
            Tipo de pessoa
          </Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Controller
                name="personType"
                control={control}
                render={({ field }) => (
                  <input
                    type="radio"
                    value="physical"
                    checked={field.value === "physical"}
                    onChange={() => field.onChange("physical")}
                    disabled={isSaving}
                    className="accent-primary"
                  />
                )}
              />
              Física
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Controller
                name="personType"
                control={control}
                render={({ field }) => (
                  <input
                    type="radio"
                    value="legal"
                    checked={field.value === "legal"}
                    onChange={() => field.onChange("legal")}
                    disabled={isSaving}
                    className="accent-primary"
                  />
                )}
              />
              Jurídica
            </label>
          </div>
        </div>

        {/* Physical fields */}
        {personType === "physical" && (
          <div className="rounded-lg border border-border p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dados da pessoa física
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="physical.fullName" required>
                Nome completo
              </Label>
              <input
                id="physical.fullName"
                type="text"
                {...register("physical.fullName")}
                disabled={isSaving}
                className={inputCls(
                  Boolean("physical" in errors && errors.physical?.fullName),
                )}
              />
              <FieldError
                message={
                  "physical" in errors
                    ? errors.physical?.fullName?.message
                    : undefined
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="physical.cpf">CPF</Label>
              <input
                id="physical.cpf"
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                {...register("physical.cpf")}
                disabled={isSaving}
                className={inputCls()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="physical.birthDate">Data de nascimento</Label>
              <input
                id="physical.birthDate"
                type="date"
                {...register("physical.birthDate")}
                disabled={isSaving}
                className={inputCls()}
              />
            </div>
          </div>
        )}

        {/* Legal fields */}
        {personType === "legal" && (
          <div className="rounded-lg border border-border p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dados da pessoa jurídica
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="legal.corporateName" required>
                Razão social
              </Label>
              <input
                id="legal.corporateName"
                type="text"
                {...register("legal.corporateName")}
                disabled={isSaving}
                className={inputCls(
                  Boolean("legal" in errors && errors.legal?.corporateName),
                )}
              />
              <FieldError
                message={
                  "legal" in errors
                    ? errors.legal?.corporateName?.message
                    : undefined
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="legal.tradeName">Nome fantasia</Label>
              <input
                id="legal.tradeName"
                type="text"
                {...register("legal.tradeName")}
                disabled={isSaving}
                className={inputCls()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="legal.cnpj">CNPJ</Label>
              <input
                id="legal.cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                maxLength={18}
                {...register("legal.cnpj")}
                disabled={isSaving}
                className={inputCls()}
              />
            </div>
          </div>
        )}

        {/* Contacts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Contatos</p>
            <button
              type="button"
              onClick={() =>
                append({
                  type: "PHONE",
                  value: "",
                  primary: false,
                  active: true,
                })
              }
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Plus size={12} />
              Adicionar contato
            </button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum contato adicionado.
            </p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="flex flex-1 gap-2 flex-wrap">
                  <select
                    {...register(`contacts.${index}.type`)}
                    disabled={isSaving}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
                  >
                    {CONTACT_TYPES.map((ct) => (
                      <option key={ct.value} value={ct.value}>
                        {ct.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Valor"
                    {...register(`contacts.${index}.value`)}
                    disabled={isSaving}
                    className="flex-1 min-w-[140px] rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      {...register(`contacts.${index}.primary`)}
                      disabled={isSaving}
                      className="accent-primary"
                    />
                    Principal
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      {...register(`contacts.${index}.active`)}
                      disabled={isSaving}
                      className="accent-primary"
                    />
                    Ativo
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={isSaving}
                  aria-label="Remover contato"
                  className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center gap-3">
          <input
            id="active"
            type="checkbox"
            {...register("active")}
            disabled={isSaving}
            className="accent-primary h-4 w-4"
          />
          <label htmlFor="active" className="text-sm cursor-pointer">
            Pessoa ativa
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Salvar alterações" : "Cadastrar pessoa"}
          </button>
          <button
            type="button"
            onClick={() => void navigate("/persons")}
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
