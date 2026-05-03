import { useState, useCallback, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  GitBranch,
  ArrowLeft,
  X,
  CircleAlert,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { FlowCanvas } from "../components";
import { TemplateModal, stripHtml } from "../components/TemplateModal";
import { WhatsAppEmulator } from "../components/WhatsAppEmulator";
import {
  BOT_OPERATION,
  BOT_OPTION_TYPE,
  type BotFlowState,
  type BotTemplate,
} from "../types";
import { DEFAULT_BOT_FLOW_STATE } from "../constants/defaultBotFlow";

// ─── Initial Data ───────────────────────────────────────────────────────

const INITIAL_BOT_FLOW_STATE: BotFlowState = DEFAULT_BOT_FLOW_STATE;

const INITIAL_TEMPLATES: BotTemplate[] = [
  {
    id: "tpl-1",
    title: "Confirmação de Agendamento",
    body: "Perfeito! Seu agendamento foi confirmado para <strong>{data}</strong> às {hora}.",
    createdAt: "2026-04-15",
  },
  {
    id: "tpl-2",
    title: "Lembrete de Agendamento",
    body: "Não esqueça! Você tem um agendamento amanhã às <strong>{hora}</strong>.",
    createdAt: "2026-04-16",
  },
  {
    id: "tpl-3",
    title: "Cancelamento de Agendamento",
    body: "Seu agendamento para <strong>{data}</strong> foi cancelado.",
    createdAt: "2026-04-17",
  },
];

// ─── Main Page ─────────────────────────────────────────────────────────

type Tab = "dialogs" | "templates";
type DialogsMobileTab = "preview" | "config";

export function BotMenuPage() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const [flowState, setFlowState] = useState<BotFlowState>(
    INITIAL_BOT_FLOW_STATE,
  );
  const [templates, setTemplates] = useState<BotTemplate[]>(INITIAL_TEMPLATES);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [showDialogsInfoModal, setShowDialogsInfoModal] = useState(false);
  const [dialogsMobileTab, setDialogsMobileTab] =
    useState<DialogsMobileTab>("preview");
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] =
    useState<BotTemplate | null>(null);
  const dialogsOverlayRef = useRef<HTMLDivElement | null>(null);

  const closeDialogsOverlay = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
    setActiveTab("templates");
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (activeTab !== "dialogs") {
      return;
    }

    setShowDialogsInfoModal(true);
    setDialogsMobileTab("preview");

    const overlayElement = dialogsOverlayRef.current;
    if (!overlayElement || document.fullscreenElement === overlayElement) {
      return;
    }

    void overlayElement.requestFullscreen().catch(() => undefined);
  }, [activeTab]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (activeTab === "dialogs" && !document.fullscreenElement) {
        setActiveTab("templates");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [activeTab, closeDialogsOverlay]);

  const handleSaveTemplate = (template: BotTemplate) => {
    if (selectedTemplateForEdit) {
      setTemplates(templates.map((t) => (t.id === template.id ? template : t)));
      setSelectedTemplateForEdit(null);
    } else {
      setTemplates([...templates, template]);
    }
    setTemplateModalOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleOpenTemplateModal = (template?: BotTemplate) => {
    setSelectedTemplateForEdit(template || null);
    setTemplateModalOpen(true);
  };

  const dialogsOverlay =
    activeTab === "dialogs" ? (
      <div
        ref={dialogsOverlayRef}
        className="fixed inset-0 z-[120] flex h-screen w-screen flex-col bg-muted/30"
      >
        <div className="flex h-16 items-center border-b border-border/70 bg-gradient-to-r from-card via-card to-muted/40 px-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/90">
          <button
            onClick={() => void closeDialogsOverlay()}
            className="inline-flex items-center rounded-lg p-2 text-foreground transition-colors hover:bg-muted"
            title="Voltar para templates"
            aria-label="Voltar"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="mx-3 h-8 w-px bg-border" />

          <div className="inline-flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary">
              <GitBranch size={20} />
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-lg font-semibold text-foreground">
                Menu do Chatbot
              </span>
              <span className="text-sm text-muted-foreground">
                Editor em tela cheia
              </span>
            </div>
          </div>

          <button
            onClick={() => void closeDialogsOverlay()}
            className="ml-auto inline-flex items-center rounded-lg border border-transparent p-2 text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground"
            aria-label="Fechar"
            title="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex w-full flex-1 flex-col overflow-hidden p-0 lg:p-5">
          <div className="mx-auto w-full max-w-[1440px] border-b border-border bg-white px-3 lg:hidden">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setDialogsMobileTab("preview")}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-sm font-medium transition-colors",
                  dialogsMobileTab === "preview"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                <Eye size={14} />
                Visualizar
              </button>

              <div className="h-5 w-px bg-border" />

              <button
                type="button"
                onClick={() => setDialogsMobileTab("config")}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-sm font-medium transition-colors",
                  dialogsMobileTab === "config"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                <SlidersHorizontal size={14} />
                Configurar
              </button>
            </div>
          </div>

          <div className="mx-auto flex min-h-0 flex-1 w-full max-w-[1440px] flex-col gap-0 px-0 py-0 lg:flex-row lg:gap-5">
            <div
              className={cn(
                "min-h-0 h-full w-full flex-1 justify-center p-3 lg:w-auto lg:min-w-[320px] lg:flex-none lg:justify-start lg:p-0",
                dialogsMobileTab === "preview" ? "flex" : "hidden lg:flex",
              )}
            >
              <div className="h-full w-full max-w-[390px] overflow-hidden">
                <WhatsAppEmulator flowState={flowState} />
              </div>
            </div>

            <div
              className={cn(
                "h-full min-h-0 w-full min-w-0 flex-col rounded-none border border-border bg-card shadow-none lg:flex-1 lg:rounded-xl lg:shadow-sm",
                dialogsMobileTab === "config" ? "flex" : "hidden lg:flex",
              )}
            >
              <div className="hidden border-b border-border px-4 py-3 lg:block">
                <h3 className="text-sm font-semibold text-foreground">
                  Configuração do Menu
                </h3>
                <p className="text-xs text-muted-foreground">
                  Edite menus, opções e transições do bot
                </p>
              </div>
              <div className="flex-1 overflow-hidden">
                <FlowCanvas flowState={flowState} onUpdate={setFlowState} />
              </div>
            </div>
          </div>
        </div>

        {showDialogsInfoModal && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-xl rounded-xl border border-border bg-card p-5 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <CircleAlert size={16} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Aviso importante para configurar o menu
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Você não precisa criar opções como "Voltar ao início". Na
                    conversa, o retorno ao menu principal é tratado
                    automaticamente.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Quando a ação for diferente de "Abrir submenu", não crie
                    submenus manuais. O sistema cria automaticamente o fluxo
                    desse tipo de ação.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDialogsInfoModal(false)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    ) : null;

  return (
    <>
      <div className="h-screen flex flex-col">
        <PageHeader
          title="Chatbot"
          description="Configure menus de atendimento automático e templates de resposta."
        />

        <div className="mt-3 flex items-center gap-1 border-b border-border px-4 md:px-6">
          {(
            [
              {
                key: "templates" as const,
                label: "Templates",
                icon: <FileText size={14} />,
              },
              {
                key: "dialogs" as const,
                label: "Menu do Chatbot",
                icon: <GitBranch size={14} />,
              },
            ] as { key: Tab; label: string; icon: React.ReactNode }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Templates de Mensagens</h3>
              <button
                onClick={() => handleOpenTemplateModal()}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />
                Novo Template
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Título
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                      Corpo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templates.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                      >
                        Nenhum template criado.
                      </td>
                    </tr>
                  )}
                  {templates.map((template) => (
                    <tr
                      key={template.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {template.title}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                        <span className="line-clamp-1">
                          {stripHtml(template.body).substring(0, 60)}
                          {template.body.length > 60 ? "..." : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenTemplateModal(template)}
                            className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Editar template"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Excluir template"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <TemplateModal
          open={templateModalOpen}
          onClose={() => {
            setTemplateModalOpen(false);
            setSelectedTemplateForEdit(null);
          }}
          onSave={handleSaveTemplate}
          initialTemplate={selectedTemplateForEdit}
        />
      </div>

      {dialogsOverlay}
    </>
  );
}
