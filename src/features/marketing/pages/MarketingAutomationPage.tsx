import { useEffect, useMemo, useState } from "react";
import { Zap, FileText, Plus, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeNeededModal, PriceTableModal } from "@/features/billing/components/UpgradeModals";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  AutomationTemplate,
  MarketingAutomation,
  AutomationStatus,
  AutomationTemplateType,
} from "@/features/marketing/types/marketingTypes";
import automationData from "@/features/marketing/mocks/marketing-automation.json";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";

// ─── Mock service ─────────────────────────────────────────────────────────────

function useAutomationData() {
  const [templates, setTemplates] = useState<AutomationTemplate[]>(
    automationData.templates as AutomationTemplate[],
  );
  const [automations, setAutomations] = useState<MarketingAutomation[]>(
    automationData.automations as MarketingAutomation[],
  );

  function updateTemplate(id: string, message: string) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, message } : t)),
    );
  }

  function toggleAutomationStatus(id: string) {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "Ativa" ? "Pausada" : "Ativa" }
          : a,
      ),
    );
  }

  function addAutomation(automation: MarketingAutomation) {
    setAutomations((prev) => [automation, ...prev]);
  }

  return {
    templates,
    automations,
    updateTemplate,
    toggleAutomationStatus,
    addAutomation,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEMPLATE_TYPE_LABEL: Record<AutomationTemplateType, string> = {
  carrinho_abandonado: "Carrinho Abandonado",
  reativacao_clientes: "Reativação de Clientes",
  lembrete_agendamento: "Lembrete de Agendamento",
  followup_pos_atendimento: "Follow-up Pós-Atendimento",
};

const TEMPLATE_TYPE_COLOR: Record<AutomationTemplateType, string> = {
  carrinho_abandonado: "bg-orange-100 text-orange-800",
  reativacao_clientes: "bg-blue-100 text-blue-800",
  lembrete_agendamento: "bg-violet-100 text-violet-800",
  followup_pos_atendimento: "bg-emerald-100 text-emerald-800",
};

function triggerLabel(automation: MarketingAutomation): string {
  const { trigger } = automation;
  if (trigger.type === "tempo") {
    if (trigger.event === "abandono_carrinho") {
      return `${trigger.delayHours}h após abandono do carrinho`;
    }
    if (trigger.event === "sem_retorno") {
      return `${trigger.delayDays} dias sem retorno`;
    }
  }
  if (trigger.type === "status") {
    if (trigger.event === "agendado") {
      return `Status "Agendado" → lembrete ${Math.abs(trigger.delayHours ?? 0)}h antes`;
    }
    if (trigger.event === "atendido") {
      return `Status "Atendido" → follow-up após ${trigger.delayHours}h`;
    }
  }
  return "—";
}

function fmtDate(iso: string) {
  try {
    return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

const STATUS_BADGE: Record<AutomationStatus, { label: string; cls: string }> = {
  Ativa: { label: "Ativa", cls: "bg-emerald-100 text-emerald-800" },
  Pausada: { label: "Pausada", cls: "bg-yellow-100 text-yellow-800" },
};

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onSave,
}: {
  template: AutomationTemplate;
  onSave: (id: string, message: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(template.message);

  function handleSave() {
    onSave(template.id, draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(template.message);
    setEditing(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-foreground">{template.name}</p>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              TEMPLATE_TYPE_COLOR[template.type],
            )}
          >
            {TEMPLATE_TYPE_LABEL[template.type]}
          </span>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Pencil size={12} />
            Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X size={12} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Check size={12} />
              Salvar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/40 rounded-lg px-3 py-2">
          {template.message}
        </p>
      )}
    </div>
  );
}

// ─── Automation Row ───────────────────────────────────────────────────────────

function AutomationRow({
  automation,
  templateName,
  onToggle,
}: {
  automation: MarketingAutomation;
  templateName: string;
  onToggle: (id: string) => void;
}) {
  const badge = STATUS_BADGE[automation.status];

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">{automation.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {fmtDate(automation.createdAt)}
        </p>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
        {triggerLabel(automation)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
        {templateName}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            badge.cls,
          )}
        >
          {badge.label}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onToggle(automation.id)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            automation.status === "Ativa"
              ? "border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              : "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
          )}
        >
          {automation.status === "Ativa" ? "Pausar" : "Ativar"}
        </button>
      </td>
    </tr>
  );
}

// ─── Create Automation Form (inline, simple) ──────────────────────────────────

interface NewAutomationFormProps {
  templates: AutomationTemplate[];
  onSave: (automation: MarketingAutomation) => void;
  onCancel: () => void;
}

function NewAutomationForm({
  templates,
  onSave,
  onCancel,
}: NewAutomationFormProps) {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [triggerType, setTriggerType] = useState<
    "1h_abandono" | "7d_retorno" | "agendado" | "atendido"
  >("1h_abandono");

  function handleSave() {
    if (!name.trim()) return;

    const triggerMap: Record<
      typeof triggerType,
      MarketingAutomation["trigger"]
    > = {
      "1h_abandono": {
        type: "tempo",
        event: "abandono_carrinho",
        delayHours: 1,
      },
      "7d_retorno": { type: "tempo", event: "sem_retorno", delayDays: 7 },
      agendado: { type: "status", event: "agendado", delayHours: -24 },
      atendido: { type: "status", event: "atendido", delayHours: 2 },
    };

    onSave({
      id: `auto-${Date.now()}`,
      name: name.trim(),
      templateId,
      trigger: triggerMap[triggerType],
      status: "Ativa",
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
      <p className="text-sm font-medium text-foreground">Nova automação</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Nome
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da automação"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Gatilho
          </label>
          <select
            value={triggerType}
            onChange={(e) =>
              setTriggerType(e.target.value as typeof triggerType)
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="1h_abandono">1h após abandono do carrinho</option>
            <option value="7d_retorno">7 dias sem retorno</option>
            <option value="agendado">
              Status Agendado (lembrete 24h antes)
            </option>
            <option value="atendido">
              Status Atendido (follow-up 2h depois)
            </option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Template
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={onCancel}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Salvar Automação
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MarketingAutomationPage() {
  const {
    templates,
    automations,
    updateTemplate,
    toggleAutomationStatus,
    addAutomation,
  } = useAutomationData();
  const [showNewForm, setShowNewForm] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getDefaultPageSize());
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [priceTableOpen, setPriceTableOpen] = useState(false);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(automations.length / pageSize));
  const pagedAutomations = useMemo(() => {
    const start = (page - 1) * pageSize;
    return automations.slice(start, start + pageSize);
  }, [automations, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function getTemplateName(templateId: string): string {
    return templates.find((t) => t.id === templateId)?.name ?? "—";
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold">Marketing Automatizado</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Templates e automações de mensagens para o funil de marketing
        </p>
      </div>

      {/* ── Templates ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-muted-foreground" />
          <h2 className="text-lg font-semibold">Templates de Mensagem</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {templates.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} onSave={updateTemplate} />
          ))}
        </div>
      </section>

      {/* ── Automações ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-muted-foreground" />
            <h2 className="text-lg font-semibold">Automações Configuradas</h2>
          </div>
          {!showNewForm && (
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Nova Automação
            </button>
          )}
        </div>

        {showNewForm && (
          <NewAutomationForm
            templates={templates}
            onSave={(automation) => {
              addAutomation(automation);
              setShowNewForm(false);
            }}
            onCancel={() => setShowNewForm(false)}
          />
        )}

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                  Gatilho
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody>
              {automations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Zap size={28} className="opacity-30" />
                      <p className="text-sm">Nenhuma automação configurada.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedAutomations.map((auto) => (
                  <AutomationRow
                    key={auto.id}
                    automation={auto}
                    templateName={getTemplateName(auto.templateId)}
                    onToggle={(id) => {
                      // If automation is currently not active, attempt to activate -> show upgrade modal
                      const current = automations.find((a) => a.id === id);
                      if (current && current.status !== "Ativa") {
                        setPendingToggleId(id);
                        setUpgradeModalOpen(true);
                        return;
                      }
                      toggleAutomationStatus(id);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>

          <TablePagination
            page={page - 1}
            totalPages={totalPages}
            totalElements={automations.length}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setDefaultPageSize(size);
              setPageSize(size);
              setPage(1);
            }}
            onFirst={() => setPage(1)}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            onLast={() => setPage(totalPages)}
          />
        </div>
      </section>
      <UpgradeNeededModal
        open={upgradeModalOpen}
        onClose={() => {
          setUpgradeModalOpen(false);
          setPendingToggleId(null);
        }}
        onViewPlans={() => {
          setUpgradeModalOpen(false);
          setPriceTableOpen(true);
        }}
      />

      <PriceTableModal open={priceTableOpen} onClose={() => setPriceTableOpen(false)} />
    </div>
  );
}
