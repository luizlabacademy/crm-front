import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, X } from "lucide-react";
import {
  useLead,
  useCreateLead,
  useUpdateLead,
  usePipelineFlows,
} from "@/features/leads/api/useLeads";
import { useCustomers } from "@/features/customers/api/useCustomers";
import { useTenantsSelector } from "@/lib/api/useTenants";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  tenantId: z.coerce.number().min(1, "Selecione um tenant"),
  flowId: z.coerce.number().min(1, "Selecione um funil"),
  customerId: z.coerce.number().optional().nullable(),
  status: z.string().min(1, "Status obrigatório"),
  source: z.string().optional().nullable(),
  estimatedValue: z.coerce
    .number()
    .min(0, "Valor deve ser positivo")
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50";

// ─── Customer autocomplete ────────────────────────────────────────────────────

function CustomerAutocomplete({
  tenantId,
  value,
  onChange,
}: {
  tenantId: number | null;
  value: number | null | undefined;
  onChange: (id: number | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data } = useCustomers({
    page: 0,
    size: 10,
    tenantId: tenantId ?? undefined,
  });

  const customers = data?.content ?? [];
  const filtered = search
    ? customers.filter((c) =>
        (c?.fullName ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : customers;

  const selectedName = value
    ? (customers.find((c) => c.id === value)?.fullName ?? null) || `ID ${value}`
    : "";

  return (
    <div className="relative">
      <input
        type="text"
        value={open ? search : selectedName}
        onFocus={() => {
          setOpen(true);
          setSearch("");
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar cliente (opcional)..."
        className={inputClass}
      />
      {value && !open && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => onChange(null)}
        >
          <X size={14} />
        </button>
      )}
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-card shadow-md text-sm">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="cursor-pointer px-3 py-2 hover:bg-accent transition-colors"
              onMouseDown={() => {
                onChange(c.id);
                setOpen(false);
              }}
            >
              {c.fullName ?? `ID ${c.id}`}{" "}
              <span className="text-xs text-muted-foreground">#{c.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LeadFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);
  const leadId = isEdit ? parseInt(id!, 10) : null;

  const { data: leadData, isLoading: leadLoading } = useLead(leadId);
  const { data: tenantsData, isLoading: tenantsLoading } = useTenantsSelector();
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();

  const tenants = tenantsData?.content ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "NEW",
      tenantId: undefined,
      flowId: undefined,
      customerId: searchParams.get("customerId")
        ? parseInt(searchParams.get("customerId")!, 10)
        : null,
    },
  });

  const watchedTenantId = watch("tenantId");
  const watchedFlowId = watch("flowId");

  const { data: flowsData } = usePipelineFlows(
    watchedTenantId ? Number(watchedTenantId) : null,
  );
  const flows = Array.isArray(flowsData) ? flowsData : [];
  const selectedFlow = flows.find((f) => f.id === Number(watchedFlowId));
  const stepOptions = selectedFlow?.steps ?? [];

  // Populate form for edit
  useEffect(() => {
    if (leadData) {
      reset({
        tenantId: leadData.tenantId,
        flowId: leadData.flowId,
        customerId: leadData.customerId ?? null,
        status: leadData.status,
        source: leadData.source ?? "",
        estimatedValue:
          leadData.estimatedValueCents != null
            ? leadData.estimatedValueCents / 100
            : null,
        notes: leadData.notes ?? "",
      });
    }
  }, [leadData, reset]);

  async function onSubmit(values: FormValues) {
    const body = {
      tenantId: values.tenantId,
      flowId: values.flowId,
      customerId: values.customerId ?? null,
      status: values.status,
      source: values.source || null,
      estimatedValueCents:
        values.estimatedValue != null
          ? Math.round(values.estimatedValue * 100)
          : null,
      notes: values.notes || null,
    };

    try {
      let saved: { id: number };
      if (isEdit && leadId) {
        saved = await updateMutation.mutateAsync({ id: leadId, body });
        toast.success("Lead atualizado com sucesso.");
      } else {
        saved = await createMutation.mutateAsync(body);
        toast.success("Lead criado com sucesso.");
      }
      void navigate(`/leads/${saved.id}`);
    } catch {
      toast.error("Erro ao salvar lead. Tente novamente.");
    }
  }

  const isBusy =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  if (isEdit && leadLoading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-9 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void navigate("/leads")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Editar lead" : "Novo lead"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Tenant */}
        <Field label="Tenant *" error={errors.tenantId?.message}>
          <select
            {...register("tenantId")}
            className={cn(inputClass, "bg-background")}
            disabled={tenantsLoading}
          >
            <option value="">Selecione um tenant...</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Funil */}
        <Field label="Funil *" error={errors.flowId?.message}>
          <select
            {...register("flowId")}
            className={cn(inputClass, "bg-background")}
            disabled={!watchedTenantId}
          >
            <option value="">
              {!watchedTenantId
                ? "Selecione um tenant primeiro..."
                : "Selecione um funil..."}
            </option>
            {flows.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Status */}
        <Field label="Status" error={errors.status?.message}>
          <select
            {...register("status")}
            className={cn(inputClass, "bg-background")}
          >
            {stepOptions.length > 0 ? (
              stepOptions.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))
            ) : (
              <>
                <option value="NEW">NEW</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="WON">WON</option>
                <option value="LOST">LOST</option>
              </>
            )}
          </select>
        </Field>

        {/* Cliente */}
        <Field label="Cliente" error={errors.customerId?.message}>
          <CustomerAutocomplete
            tenantId={watchedTenantId ? Number(watchedTenantId) : null}
            value={watch("customerId")}
            onChange={(id) => setValue("customerId", id)}
          />
        </Field>

        {/* Fonte */}
        <Field label="Fonte" error={errors.source?.message}>
          <input
            type="text"
            {...register("source")}
            placeholder="Ex.: WhatsApp, Indicação, Site..."
            className={inputClass}
          />
        </Field>

        {/* Valor estimado */}
        <Field
          label="Valor estimado (R$)"
          error={errors.estimatedValue?.message}
        >
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("estimatedValue")}
            placeholder="0,00"
            className={inputClass}
          />
        </Field>

        {/* Notas */}
        <Field label="Notas" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Observações sobre este lead..."
            className={cn(inputClass, "resize-none")}
          />
        </Field>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isBusy || !watch("flowId")}
            className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isBusy && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Salvar alterações" : "Criar lead"}
          </button>
          <button
            type="button"
            onClick={() => void navigate("/leads")}
            disabled={isBusy}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
