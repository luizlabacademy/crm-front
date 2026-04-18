import { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  GitBranch,
  Bold,
  Italic,
  List,
  Minimize2,
} from "lucide-react";
import {
  ReactFlow,
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Connection,
  addEdge,
  MiniMap,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import type { BotFlowState, Menu, BotTemplate } from "../types";

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

// ─── Custom Message Node ────────────────────────────────────────────────

interface MenuNodeData {
  menu: Menu;
  onUpdate: (menu: Menu) => void;
  onDelete: () => void;
}

function MenuNode({
  data,
  selected,
}: {
  data: MenuNodeData;
  selected: boolean;
}) {
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [questionValue, setQuestionValue] = useState(data.menu.question);
  const [editingOptionIdx, setEditingOptionIdx] = useState<number | null>(null);
  const [editingOptionLabel, setEditingOptionLabel] = useState("");

  const handleQuestionBlur = () => {
    if (questionValue.trim() !== data.menu.question) {
      data.onUpdate({ ...data.menu, question: questionValue.trim() });
    } else {
      setQuestionValue(data.menu.question);
    }
    setIsEditingQuestion(false);
  };

  const handleAddOption = () => {
    data.onUpdate({
      ...data.menu,
      options: [
        ...data.menu.options,
        { label: "Nova opção", nextMenuRef: null },
      ],
    });
  };

  const handleUpdateOptionLabel = (idx: number, newLabel: string) => {
    const updatedOptions = [...data.menu.options];
    updatedOptions[idx].label = newLabel;
    data.onUpdate({ ...data.menu, options: updatedOptions });
  };

  const handleDeleteOption = (idx: number) => {
    const updatedOptions = data.menu.options.filter((_, i) => i !== idx);
    data.onUpdate({ ...data.menu, options: updatedOptions });
  };

  return (
    <div
      className={cn(
        "rounded-lg border-2 bg-card p-4 shadow-md min-w-80 max-w-md",
        selected ? "border-primary" : "border-border"
      )}
    >
      {/* Ref badge */}
      <div className="mb-2">
        <span className="inline-block px-2 py-1 rounded text-xs font-mono bg-muted text-muted-foreground">
          {data.menu.ref}
        </span>
      </div>

      {/* Question */}
      <div className="mb-3">
        {isEditingQuestion ? (
          <textarea
            value={questionValue}
            onChange={(e) => setQuestionValue(e.target.value)}
            onBlur={handleQuestionBlur}
            autoFocus
            rows={3}
            className="w-full rounded border border-input bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <div
            onClick={() => setIsEditingQuestion(true)}
            className="cursor-pointer rounded border border-border p-2 text-sm leading-relaxed hover:bg-muted/30"
          >
            {data.menu.question}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {data.menu.options.map((option, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <Handle
              type="source"
              position={Position.Right}
              id={`opt-${idx}`}
              className="!bg-primary !w-3 !h-3"
            />
            <div className="flex-1 space-y-1">
              {editingOptionIdx === idx ? (
                <input
                  type="text"
                  value={editingOptionLabel}
                  onChange={(e) => setEditingOptionLabel(e.target.value)}
                  onBlur={() => {
                    if (editingOptionLabel.trim()) {
                      handleUpdateOptionLabel(idx, editingOptionLabel);
                    }
                    setEditingOptionIdx(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (editingOptionLabel.trim()) {
                        handleUpdateOptionLabel(idx, editingOptionLabel);
                      }
                      setEditingOptionIdx(null);
                    }
                  }}
                  autoFocus
                  className="w-full rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <button
                  onClick={() => {
                    setEditingOptionIdx(idx);
                    setEditingOptionLabel(option.label);
                  }}
                  className="w-full rounded border border-border px-2 py-1 text-xs text-left hover:bg-muted/30"
                >
                  {option.label}
                </button>
              )}
            </div>
            <button
              onClick={() => handleDeleteOption(idx)}
              className="rounded p-0.5 text-muted-foreground hover:text-destructive"
              title="Excluir opção"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add option button */}
      <button
        onClick={handleAddOption}
        className="w-full rounded border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 flex items-center justify-center gap-1 mb-3"
      >
        <Plus size={12} />
        Adicionar opção
      </button>

      {/* Delete menu button */}
      <button
        onClick={data.onDelete}
        className="w-full rounded bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20"
      >
        Excluir diálogo
      </button>

      <Handle type="target" position={Position.Left} />
    </div>
  );
}

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

  return (
    <div className="flex flex-col h-full bg-white border-r border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">
          CS
        </div>
        <div>
          <div className="text-sm font-semibold">CS Diagnostics</div>
          <div className="text-xs opacity-90">Online</div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {conversation.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            <button
              onClick={handleInitialize}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
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
                    "max-w-xs rounded-2xl px-4 py-2 text-sm",
                    turn.type === "bot"
                      ? "bg-gray-200 text-gray-900"
                      : "bg-emerald-600 text-white"
                  )}
                >
                  {turn.text || turn.label}
                </div>
              </div>
            ))}

            {/* Options */}
            {currentMenu && currentMenu.options.length > 0 && (
              <div className="mt-4 space-y-2">
                {currentMenu.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option.label, option.nextMenuRef)}
                    className="w-full rounded-full border-2 border-emerald-600 px-4 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* End message */}
            {currentMenu === undefined && conversation.length > 0 && (
              <div className="flex justify-start mt-4">
                <div className="bg-gray-200 text-gray-900 rounded-2xl px-4 py-2 text-sm">
                  Fim da conversa. Clique abaixo para reiniciar.
                </div>
              </div>
            )}

            {currentMenu === undefined && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    setConversation([]);
                    setCurrentMenuRef(null);
                    handleInitialize();
                  }}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Reiniciar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Flow Builder Canvas ────────────────────────────────────────────────

interface FlowCanvasProps {
  flowState: BotFlowState;
  onUpdate: (flowState: BotFlowState) => void;
}

function FlowCanvas({ flowState, onUpdate }: FlowCanvasProps) {
  const initialRfNodes: Node[] = flowState.menus.map((menu, idx) => ({
    id: menu.ref,
    data: {
      menu,
      onUpdate: (updatedMenu: Menu) => {
        onUpdate({
          ...flowState,
          menus: flowState.menus.map((m) =>
            m.ref === updatedMenu.ref ? updatedMenu : m
          ),
        });
      },
      onDelete: () => {
        onUpdate({
          ...flowState,
          menus: flowState.menus.filter((m) => m.ref !== menu.ref),
        });
      },
    },
    position: { x: idx * 400, y: idx * 150 },
    type: "menuNode",
  }));

  const initialRfEdges: Edge[] = [];
  flowState.menus.forEach((menu) => {
    menu.options.forEach((option, optIdx) => {
      if (option.nextMenuRef) {
        initialRfEdges.push({
          id: `edge-${menu.ref}-${optIdx}`,
          source: menu.ref,
          sourceHandle: `opt-${optIdx}`,
          target: option.nextMenuRef,
          animated: true,
        });
      }
    });
  });

  const [nodes, , onNodesChange] = useNodesState(initialRfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialRfEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = addEdge(connection, edges);
      setEdges(edge);

      if (connection.sourceHandle) {
        const sourceMenu = flowState.menus.find((m) => m.ref === connection.source);
        if (sourceMenu && connection.sourceHandle.startsWith("opt-")) {
          const optIdx = parseInt(connection.sourceHandle.replace("opt-", ""));
          const updatedOptions = [...sourceMenu.options];
          updatedOptions[optIdx].nextMenuRef = connection.target || null;
          const updatedMenu = { ...sourceMenu, options: updatedOptions };
          onUpdate({
            ...flowState,
            menus: flowState.menus.map((m) =>
              m.ref === sourceMenu.ref ? updatedMenu : m
            ),
          });
        }
      }
    },
    [edges, flowState, onUpdate, setEdges]
  );

  const handleAddMenu = () => {
    const newRef = `NOVO_MENU_${Date.now()}`;
    const newMenu: Menu = {
      ref: newRef,
      question: "Nova pergunta?",
      options: [],
    };
    onUpdate({
      ...flowState,
      menus: [...flowState.menus, newMenu],
    });
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-md">
        <button
          onClick={handleAddMenu}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          title="Adicionar novo diálogo"
        >
          <Plus size={14} />
          Novo diálogo
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={{ menuNode: MenuNode }}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
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

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error("Failed to enter fullscreen:", err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setActiveTab("templates");
    } catch (err) {
      console.error("Failed to exit fullscreen:", err);
    }
  }, []);

  // Handle tab change - enter fullscreen if switching to dialogs
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "dialogs") {
      enterFullscreen();
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && activeTab === "dialogs") {
        // User exited fullscreen, switch back to templates
        setActiveTab("templates");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [activeTab]);

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

  if (activeTab === "dialogs" && document.fullscreenElement) {
    return (
      <div className="w-screen h-screen flex flex-col bg-background">
        {/* Fullscreen Close Button - Floating */}
        <button
          onClick={exitFullscreen}
          className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors text-sm shadow-lg"
          title="Sair de tela cheia (ESC)"
        >
          <Minimize2 size={18} />
          Sair (ESC)
        </button>

        {/* Fullscreen Content - Full Height */}
        <div className="w-full h-full overflow-hidden p-6">
          <div className="flex gap-6 h-full">
            <div className="w-[25%]">
              <WhatsAppEmulator flowState={flowState} />
            </div>
            <div className="flex-1">
              <FlowCanvas flowState={flowState} onUpdate={setFlowState} />
            </div>
          </div>
        </div>

        {/* Template Modal */}
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
    );
  }

  return (
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
              key: "dialogs" as const,
              label: "Diálogos do Bot",
              icon: <GitBranch size={14} />,
            },
            {
              key: "templates" as const,
              label: "Templates",
              icon: <FileText size={14} />,
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
        {activeTab === "dialogs" ? (
          <div className="flex gap-6 h-full">
            {/* Left: WhatsApp Emulator */}
            <div className="w-[25%]">
              <WhatsAppEmulator flowState={flowState} />
            </div>

            {/* Right: Flow Builder */}
            <div className="flex-1">
              <FlowCanvas flowState={flowState} onUpdate={setFlowState} />
            </div>
          </div>
        ) : (
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
        )}
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
  );
}
