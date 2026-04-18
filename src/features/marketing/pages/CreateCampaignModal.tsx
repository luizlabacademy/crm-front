import { useState } from "react";
import { X, Upload, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CreateCampaignPayload,
  CampaignType,
  CampaignAudienceType,
  CampaignDestinationType,
} from "@/features/marketing/types/marketingTypes";
import automationData from "@/mocks/GET-marketing--automation.json";

// ─── Constants ────────────────────────────────────────────────────────────────

const CAMPAIGN_TYPES: CampaignType[] = [
  "Remarketing",
  "Recovery",
  "Re-engagement",
];

const AUDIENCE_OPTIONS: {
  value: CampaignAudienceType;
  label: string;
  hasdays?: boolean;
}[] = [
  { value: "full_list", label: "Lista completa" },
  { value: "no_purchase_days", label: "Não compram há X dias", hasdays: true },
  { value: "no_show", label: "Não compareceram" },
];

const DESTINATION_OPTIONS: { value: CampaignDestinationType; label: string }[] =
  [
    { value: "whatsapp", label: "WhatsApp Business (link)" },
    { value: "landing_page", label: "Landing page (URL)" },
  ];

// ─── Field components ─────────────────────────────────────────────────────────

function Label({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-foreground mb-1"
    >
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground",
        props.className,
      )}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none",
        props.className,
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          "w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring",
          props.className,
        )}
      />
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
      {children}
    </p>
  );
}

// ─── Form state type ──────────────────────────────────────────────────────────

interface FormState {
  name: string;
  type: CampaignType;
  audienceType: CampaignAudienceType;
  audienceDays: string;
  templateId: string;
  templateContent: string;
  destinationType: CampaignDestinationType;
  destinationUrl: string;
}

const DEFAULT_FORM: FormState = {
  name: "",
  type: "Remarketing",
  audienceType: "full_list",
  audienceDays: "30",
  templateId: "",
  templateContent: "",
  destinationType: "whatsapp",
  destinationUrl: "",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateCampaignPayload) => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function CreateCampaignModal({
  open,
  onClose,
  onCreate,
}: CreateCampaignModalProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [bannerName, setBannerName] = useState<string | null>(null);

  const templates = automationData.responseBody.templates;

  if (!open) return null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTemplateSelect(templateId: string) {
    const tpl = templates.find((t) => t.id === templateId);
    set("templateId", templateId);
    if (tpl) set("templateContent", tpl.message);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload: CreateCampaignPayload = {
      name: form.name.trim(),
      type: form.type,
      audience:
        form.audienceType === "no_purchase_days"
          ? { type: form.audienceType, days: Number(form.audienceDays) }
          : { type: form.audienceType },
      templateId: form.templateId,
      templateContent: form.templateContent,
      destination: {
        type: form.destinationType,
        url: form.destinationUrl,
      },
    };

    onCreate(payload);
    setForm(DEFAULT_FORM);
    setBannerName(null);
    onClose();
  }

  function handleClose() {
    setForm(DEFAULT_FORM);
    setBannerName(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-semibold">Criar Campanha</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Preencha os dados para criar uma nova campanha
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
        >
          {/* ── Informações ── */}
          <section className="space-y-4">
            <SectionHeading>Informações</SectionHeading>

            <div>
              <Label htmlFor="camp-name">Nome da campanha *</Label>
              <Input
                id="camp-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ex.: Remarketing Verão 2026"
                required
              />
            </div>

            <div>
              <Label htmlFor="camp-type">Tipo</Label>
              <Select
                id="camp-type"
                value={form.type}
                onChange={(e) => set("type", e.target.value as CampaignType)}
              >
                {CAMPAIGN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
          </section>

          {/* ── Público ── */}
          <section className="space-y-4">
            <SectionHeading>Público</SectionHeading>

            <div>
              <Label htmlFor="camp-audience">Segmentação</Label>
              <Select
                id="camp-audience"
                value={form.audienceType}
                onChange={(e) =>
                  set("audienceType", e.target.value as CampaignAudienceType)
                }
              >
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>

            {form.audienceType === "no_purchase_days" && (
              <div>
                <Label htmlFor="camp-days">Número de dias (X)</Label>
                <Input
                  id="camp-days"
                  type="number"
                  min={1}
                  value={form.audienceDays}
                  onChange={(e) => set("audienceDays", e.target.value)}
                  placeholder="Ex.: 30"
                />
              </div>
            )}
          </section>

          {/* ── Conteúdo ── */}
          <section className="space-y-4">
            <SectionHeading>Conteúdo</SectionHeading>

            <div>
              <Label htmlFor="camp-template">Template de mensagem</Label>
              <Select
                id="camp-template"
                value={form.templateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
              >
                <option value="">Selecione um template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="camp-message">Mensagem</Label>
              <Textarea
                id="camp-message"
                rows={4}
                value={form.templateContent}
                onChange={(e) => set("templateContent", e.target.value)}
                placeholder="Escreva ou edite a mensagem da campanha..."
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Use {"{{nome}}"}, {"{{link}}"}, {"{{cupom}}"} como variáveis.
              </p>
            </div>

            {/* Banner upload (mock) */}
            <div>
              <Label>Banner (opcional)</Label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">
                <Upload size={16} />
                {bannerName ? (
                  <span className="truncate text-foreground">{bannerName}</span>
                ) : (
                  <span>Clique para selecionar uma imagem</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) =>
                    setBannerName(e.target.files?.[0]?.name ?? null)
                  }
                />
              </label>
            </div>
          </section>

          {/* ── Destino ── */}
          <section className="space-y-4">
            <SectionHeading>Destino</SectionHeading>

            <div>
              <Label htmlFor="camp-dest-type">Tipo de destino</Label>
              <Select
                id="camp-dest-type"
                value={form.destinationType}
                onChange={(e) =>
                  set(
                    "destinationType",
                    e.target.value as CampaignDestinationType,
                  )
                }
              >
                {DESTINATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="camp-dest-url">
                {form.destinationType === "whatsapp"
                  ? "Link do WhatsApp Business"
                  : "URL da Landing Page"}
              </Label>
              <Input
                id="camp-dest-url"
                type="url"
                value={form.destinationUrl}
                onChange={(e) => set("destinationUrl", e.target.value)}
                placeholder={
                  form.destinationType === "whatsapp"
                    ? "https://wa.me/55..."
                    : "https://..."
                }
              />
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Criar Campanha
          </button>
        </div>
      </div>
    </div>
  );
}
