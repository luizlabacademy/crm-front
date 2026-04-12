import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useTenants,
} from "@/features/customers/api/useCustomers";
import { usePersons } from "@/features/persons/api/usePersons";
import { getPersonDisplayName } from "@/features/persons/types/personTypes";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  tenantId: z.coerce.number().min(1, "Tenant é obrigatório"),
  personId: z.coerce.number().optional().nullable(),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  document: z.string().optional(),
  active: z.boolean(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripMask(value: string): string {
  return value.replace(/\D/g, "");
}

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

// ─── Person search dropdown ───────────────────────────────────────────────────

interface PersonSelectorProps {
  value: number | null | undefined;
  onChange: (id: number | null) => void;
  disabled?: boolean;
}

function PersonSelector({ value, onChange, disabled }: PersonSelectorProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data } = usePersons({ page: 0, size: 50 });
  const persons = data?.content ?? [];

  const filtered = persons.filter((p) => {
    const name = getPersonDisplayName(p).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const selectedPerson = persons.find((p) => p.id === value);
  const displayValue = selectedPerson
    ? getPersonDisplayName(selectedPerson)
    : "";

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={open ? search : displayValue}
          placeholder="Buscar pessoa..."
          disabled={disabled}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className={cn(
            "w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm outline-none",
            "focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50",
          )}
        />
        <Search
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent transition-colors"
            onMouseDown={() => {
              onChange(null);
              setSearch("");
              setOpen(false);
            }}
          >
            Nenhuma (sem vínculo)
          </button>
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
              onMouseDown={() => {
                onChange(p.id);
                setSearch("");
                setOpen(false);
              }}
            >
              {getPersonDisplayName(p)}{" "}
              <span className="text-xs text-muted-foreground">#{p.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CustomerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const customerId = id ? parseInt(id, 10) : null;

  const prefilledPersonId = searchParams.get("personId")
    ? parseInt(searchParams.get("personId")!, 10)
    : null;

  const {
    data: customer,
    isLoading: isLoadingCustomer,
    isError: isCustomerError,
  } = useCustomer(customerId);
  const { data: tenantsData } = useTenants();

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const tenants = tenantsData?.content ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantId: 0,
      personId: prefilledPersonId ?? null,
      fullName: "",
      email: "",
      phone: "",
      document: "",
      active: true,
      notes: "",
    },
  });

  const personId = watch("personId");

  // Populate form on edit
  useEffect(() => {
    if (!customer) return;
    reset({
      tenantId: customer.tenantId,
      personId: customer.personId ?? null,
      fullName: customer.fullName,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      document: customer.document ?? "",
      active: customer.active,
      notes: customer.notes ?? "",
    });
  }, [customer, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const body = {
        tenantId: values.tenantId,
        personId: values.personId ?? null,
        fullName: values.fullName,
        email: values.email || null,
        phone: values.phone ? stripMask(values.phone) : null,
        document: values.document ? stripMask(values.document) : null,
        active: values.active,
        notes: values.notes || null,
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
        }
      }
    }
  }

  // Loading skeleton (edit mode)
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

  // Error loading customer
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
        <button
          type="button"
          onClick={() => void navigate("/customers")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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

        {/* Person */}
        <div className="space-y-1.5">
          <Label htmlFor="personId">Pessoa vinculada</Label>
          <PersonSelector
            value={personId}
            onChange={(val) => setValue("personId", val)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Opcional. Vincula o cliente a uma pessoa cadastrada no sistema.
          </p>
        </div>

        {/* Full name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" required>
            Nome completo
          </Label>
          <input
            id="fullName"
            type="text"
            {...register("fullName")}
            disabled={isSaving}
            className={inputCls(Boolean(errors.fullName))}
          />
          <FieldError message={errors.fullName?.message} />
        </div>

        {/* Email */}
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

        {/* Phone */}
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

        {/* Document */}
        <div className="space-y-1.5">
          <Label htmlFor="document">Documento (CPF / CNPJ)</Label>
          <input
            id="document"
            type="text"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            maxLength={18}
            {...register("document")}
            disabled={isSaving}
            className={inputCls()}
          />
        </div>

        {/* Notes */}
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
            Cliente ativo
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
            {isEdit ? "Salvar alterações" : "Cadastrar cliente"}
          </button>
          <button
            type="button"
            onClick={() => void navigate("/customers")}
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
