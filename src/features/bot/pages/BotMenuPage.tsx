import { useState, useCallback, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  GitBranch,
  Bold,
  Italic,
  List,
  ArrowLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { FlowCanvas } from "../components";
import type { BotFlowState, BotTemplate } from "../types";

// ─── Initial Data ───────────────────────────────────────────────────────

const INITIAL_BOT_FLOW_STATE: BotFlowState = {
  initialMenuRef: "PRINCIPAL",
  menus: [
    {
      ref: "PRINCIPAL",
      question: "Olá! O que você deseja?",
      options: [
        { label: "Agendar atendimento", nextMenuRef: "AGENDAR" },
        { label: "Meus agendamentos", nextMenuRef: "MEUS_AGENDAMENTOS" },
        { label: "Serviços", nextMenuRef: "SERVICOS" },
        { label: "Falar com atendente", nextMenuRef: "ATENDENTE" },
      ],
    },
    {
      ref: "AGENDAR",
      question: "Qual serviço?",
      options: [
        { label: "Cabelo", nextMenuRef: "CONFIRMAR_SERVICO" },
        { label: "Unhas", nextMenuRef: "CONFIRMAR_SERVICO" },
        { label: "Sobrancelhas", nextMenuRef: "CONFIRMAR_SERVICO" },
        { label: "Voltar", nextMenuRef: "PRINCIPAL" },
      ],
    },
    {
      ref: "CONFIRMAR_SERVICO",
      question: "Deseja confirmar o agendamento?",
      options: [
        { label: "Sim", nextMenuRef: "CONFIRMADO" },
        { label: "Não", nextMenuRef: "AGENDAR" },
      ],
    },
    {
      ref: "CONFIRMADO",
      question: "Agendamento confirmado. Deseja algo mais?",
      options: [
        { label: "Novo agendamento", nextMenuRef: "AGENDAR" },
        { label: "Menu principal", nextMenuRef: "PRINCIPAL" },
      ],
    },
    {
      ref: "MEUS_AGENDAMENTOS",
      question: "O que deseja fazer?",
      options: [
        { label: "Consultar", nextMenuRef: "CONSULTAR" },
        { label: "Cancelar", nextMenuRef: "CANCELAR" },
        { label: "Voltar", nextMenuRef: "PRINCIPAL" },
      ],
    },
    {
      ref: "CONSULTAR",
      question: "Consultando seu agendamento...",
      options: [{ label: "Voltar", nextMenuRef: "MEUS_AGENDAMENTOS" }],
    },
    {
      ref: "CANCELAR",
      question: "Deseja cancelar seu agendamento?",
      options: [
        { label: "Sim", nextMenuRef: "PRINCIPAL" },
        { label: "Não", nextMenuRef: "MEUS_AGENDAMENTOS" },
      ],
    },
    {
      ref: "SERVICOS",
      question: "Quais serviços deseja ver?",
      options: [
        { label: "Cabelo", nextMenuRef: "AGENDAR" },
        { label: "Unhas", nextMenuRef: "AGENDAR" },
        { label: "Voltar", nextMenuRef: "PRINCIPAL" },
      ],
    },
    {
      ref: "ATENDENTE",
      question: "Estamos te transferindo para um atendente.",
      options: [{ label: "Voltar", nextMenuRef: "PRINCIPAL" }],
    },
  ],
};

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


// ─── Template Modal ─────────────────────────────────────────────────────

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (template: BotTemplate) => void;
  initialTemplate?: BotTemplate | null;
}

function TemplateModal({
  open,
  onClose,
  onSave,
  initialTemplate,
}: TemplateModalProps) {
  const [title, setTitle] = useState(initialTemplate?.title ?? "");
  const [body, setBody] = useState(initialTemplate?.body ?? "");

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;

    const template: BotTemplate = {
      id: initialTemplate?.id ?? `tpl-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      createdAt: initialTemplate?.createdAt ?? new Date().toISOString(),
    };

    onSave(template);
    setTitle("");
    setBody("");
    onClose();
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-lg max-h-[80vh] overflow-auto">
        <h2 className="text-lg font-semibold mb-4">
          {initialTemplate ? "Editar Template" : "Novo Template"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Confirmação de Agendamento"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Conteúdo</label>

            {/* Toolbar */}
            <div className="flex items-center gap-1 border border-input rounded-t-lg bg-muted/30 p-2">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("bold");
                }}
                className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Negrito (Ctrl+B)"
              >
                <Bold size={16} />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("italic");
                }}
                className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Itálico (Ctrl+I)"
              >
                <Italic size={16} />
              </button>
              <div className="w-px h-6 bg-border mx-1" />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("insertUnorderedList");
                }}
                className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Lista"
              >
                <List size={16} />
              </button>
              <div className="w-px h-6 bg-border mx-1" />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat("removeFormat");
                }}
                className="rounded p-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Limpar formatação"
              >
                Limpar
              </button>
            </div>

            {/* Editor */}
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                const content = (e.currentTarget as HTMLDivElement).innerHTML;
                setBody(content);
              }}
              dangerouslySetInnerHTML={{ __html: body }}
              className="w-full rounded-b-lg border border-t-0 border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring min-h-[200px] max-h-[400px] overflow-auto"
              style={{ whiteSpace: "pre-wrap" }}
            />

            <p className="text-xs text-muted-foreground mt-1">
              Use {"{variável}"} para inserir variáveis dinâmicas
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 border-t border-border pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !body.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WhatsApp Emulator ───────────────────────────────────────────────────

interface ConversationTurn {
  type: "bot" | "user";
  text?: string;
  label?: string;
}

function WhatsAppEmulator({ flowState }: { flowState: BotFlowState }) {
  const [currentMenuRef, setCurrentMenuRef] = useState<string | null>(
    flowState.initialMenuRef
  );
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const handleInitialize = () => {
    const startMenu = flowState.menus.find(
      (m) => m.ref === flowState.initialMenuRef
    );
    if (startMenu) {
      setCurrentMenuRef(startMenu.ref);
      setConversation([{ type: "bot", text: startMenu.question }]);
    }
  };

  const handleOptionClick = (label: string, nextMenuRef: string | null) => {
    const newConversation: ConversationTurn[] = [
      ...conversation,
      { type: "user", label },
    ];

    if (nextMenuRef) {
      const nextMenu = flowState.menus.find((m) => m.ref === nextMenuRef);
      if (nextMenu) {
        newConversation.push({ type: "bot", text: nextMenu.question });
        setConversation(newConversation);
        setCurrentMenuRef(nextMenuRef);
        return;
      }
    }

    setConversation(newConversation);
    setCurrentMenuRef(null);
  };

  const currentMenu = flowState.menus.find((m) => m.ref === currentMenuRef);

  useEffect(() => {
    const chatContainer = chatScrollRef.current;
    if (!chatContainer) {
      return;
    }

    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [conversation, currentMenuRef]);

  return (
    <div className="flex h-full items-center justify-start bg-transparent">
      <div className="relative h-full w-full max-w-[390px] rounded-[42px] bg-neutral-900 p-[10px] shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
        <div className="absolute left-[-3px] top-28 h-10 w-1 rounded-l-full bg-neutral-700/70" />
        <div className="absolute left-[-3px] top-44 h-16 w-1 rounded-l-full bg-neutral-700/70" />
        <div className="absolute right-[-3px] top-36 h-20 w-1 rounded-r-full bg-neutral-700/70" />

        <div className="relative flex h-full flex-col overflow-hidden rounded-[34px] border border-black/30 bg-[#0b141a]">
          <div className="pointer-events-none absolute left-1/2 top-2 h-6 w-28 -translate-x-1/2 rounded-full bg-black/85" />

          <div className="mt-6 flex items-center gap-3 border-b border-white/10 bg-[#111b21] px-4 py-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold uppercase tracking-wide text-white">
              sb
            </div>
            <div>
              <div className="text-sm font-semibold">Studio Belle</div>
              <div className="text-xs text-emerald-300">Online</div>
            </div>
          </div>

          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto space-y-3 bg-[#0b141a] bg-[radial-gradient(circle_at_top_left,rgba(22,50,58,0.6),transparent_45%)] p-4 [scrollbar-width:thin] [scrollbar-color:rgba(134,150,160,0.6)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#8696a0]/60 hover:[&::-webkit-scrollbar-thumb]:bg-[#8696a0]/80"
          >
            {conversation.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <button
                  onClick={handleInitialize}
                  className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-400"
                >
                  Iniciar conversa
                </button>
              </div>
            ) : (
              <>
                {conversation.map((turn, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex",
                      turn.type === "bot" ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                        turn.type === "bot"
                          ? "rounded-tl-sm bg-[#202c33] text-[#e9edef]"
                          : "rounded-tr-sm bg-[#005c4b] text-white"
                      )}
                    >
                      {turn.text || turn.label}
                    </div>
                  </div>
                ))}

                {currentMenu && currentMenu.options.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {currentMenu.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleOptionClick(option.label, option.nextMenuRef)
                        }
                        className="w-full rounded-xl border border-emerald-400/60 bg-[#111b21] px-4 py-2.5 text-left text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {currentMenu === undefined && conversation.length > 0 && (
                  <div className="mt-3 flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#202c33] px-3.5 py-2.5 text-sm text-[#e9edef]">
                      Fim da conversa. Clique abaixo para reiniciar.
                    </div>
                  </div>
                )}

                {currentMenu === undefined && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => {
                        setConversation([]);
                        setCurrentMenuRef(null);
                        handleInitialize();
                      }}
                      className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
                    >
                      Reiniciar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-white/10 bg-[#111b21] px-4 py-3">
            <div className="rounded-full bg-[#202c33] px-4 py-2 text-xs text-[#8696a0]">
              Digite uma mensagem...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Main Page ─────────────────────────────────────────────────────────

type Tab = "dialogs" | "templates";

export function BotMenuPage() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const [flowState, setFlowState] = useState<BotFlowState>(
    INITIAL_BOT_FLOW_STATE
  );
  const [templates, setTemplates] = useState<BotTemplate[]>(INITIAL_TEMPLATES);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] =
    useState<BotTemplate | null>(null);
  const dialogsOverlayRef = useRef<HTMLDivElement | null>(null);

  const closeDialogsOverlay = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
    setActiveTab("templates");
  }, []);

  // Handle tab change - enter fullscreen if switching to dialogs
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  // Enter browser fullscreen (F11-like) when opening dialogs
  useEffect(() => {
    if (activeTab !== "dialogs") {
      return;
    }

    const overlayElement = dialogsOverlayRef.current;
    if (!overlayElement || document.fullscreenElement === overlayElement) {
      return;
    }

    void overlayElement.requestFullscreen().catch(() => undefined);
  }, [activeTab]);

  // If user exits fullscreen via ESC/browser controls, go back to templates tab
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
      setTemplates(
        templates.map((t) => (t.id === template.id ? template : t))
      );
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
              <span className="text-lg font-semibold text-foreground">Menus do Bot</span>
              <span className="text-sm text-muted-foreground">Editor em tela cheia</span>
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

        <div className="w-full flex-1 overflow-hidden p-5">
          <div className="flex h-full gap-5">
            <div className="flex w-auto min-w-[320px] flex-col">
              <div className="flex-1 overflow-hidden">
                <WhatsAppEmulator flowState={flowState} />
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Configuração do Menu
                </h3>
                <p className="text-xs text-muted-foreground">
                  Edite menus, opções e transições do bot
                </p>
              </div>
              <div className="flex-1 overflow-hidden p-4">
                <FlowCanvas flowState={flowState} onUpdate={setFlowState} />
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <div className="h-screen flex flex-col">
        <PageHeader
          title="Bot"
          description="Configure menus de atendimento automático e templates de resposta."
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border px-6">
          {(
            [
              {
                key: "templates" as const,
                label: "Templates",
                icon: <FileText size={14} />,
              },
              {
                key: "dialogs" as const,
                label: "Menus do Bot",
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
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
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
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              template.body.substring(0, 60) +
                              (template.body.length > 60 ? "..." : ""),
                          }}
                          className="line-clamp-1"
                        />
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

        {/* Modals */}
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
