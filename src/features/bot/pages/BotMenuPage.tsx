import { useState, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  GitBranch,
  Bold,
  Italic,
  List,
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
import type { FlowState, FlowNode, BotTemplate } from "../types";

// ─── Initial Data ───────────────────────────────────────────────────────

const INITIAL_FLOW_STATE: FlowState = {
  startNodeId: "start",
  nodes: [
    {
      id: "start",
      type: "message",
      text: "Olá! Como posso te ajudar?",
      options: [
        { id: "opt-1", label: "Agendar Atendimento", next: "schedule" },
        { id: "opt-2", label: "Coletar Relatório", next: "report" },
      ],
    },
    {
      id: "schedule",
      type: "message",
      text: "Qual serviço você deseja agendar?",
      options: [
        { id: "opt-3", label: "Cuidados com Diabetes", next: null },
        { id: "opt-4", label: "Check-up Básico", next: null },
        { id: "opt-5", label: "Check-up Completo", next: null },
      ],
    },
    {
      id: "report",
      type: "message",
      text: "Por favor, informe o ID do relatório.",
      options: [],
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

interface MessageNodeData {
  label: string;
  node: FlowNode;
  onUpdate: (node: FlowNode) => void;
  onDelete: () => void;
}

function MessageNode({
  data,
  selected,
}: {
  data: MessageNodeData;
  selected: boolean;
}) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [textValue, setTextValue] = useState(data.node.text);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingOptionLabel, setEditingOptionLabel] = useState("");

  const handleTextBlur = () => {
    if (textValue.trim() !== data.node.text) {
      data.onUpdate({ ...data.node, text: textValue.trim() });
    } else {
      setTextValue(data.node.text);
    }
    setIsEditingText(false);
  };

  const handleAddOption = () => {
    const newOption = {
      id: `opt-${Date.now()}`,
      label: "Nova opção",
      next: null,
    };
    data.onUpdate({
      ...data.node,
      options: [...data.node.options, newOption],
    });
  };

  const handleUpdateOptionLabel = (optionId: string, newLabel: string) => {
    data.onUpdate({
      ...data.node,
      options: data.node.options.map((opt) =>
        opt.id === optionId ? { ...opt, label: newLabel } : opt
      ),
    });
  };

  const handleDeleteOption = (optionId: string) => {
    data.onUpdate({
      ...data.node,
      options: data.node.options.filter((opt) => opt.id !== optionId),
    });
  };

  return (
    <div
      className={cn(
        "rounded-lg border-2 bg-card p-4 shadow-md min-w-72 max-w-sm",
        selected ? "border-primary" : "border-border"
      )}
    >
      {/* Text */}
      <div className="mb-3">
        {isEditingText ? (
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={handleTextBlur}
            autoFocus
            rows={3}
            className="w-full rounded border border-input bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <div
            onClick={() => setIsEditingText(true)}
            className="cursor-pointer rounded border border-border p-2 text-sm leading-relaxed hover:bg-muted/30"
          >
            {data.node.text}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {data.node.options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <Handle
              type="source"
              position={Position.Right}
              id={option.id}
              className="!bg-primary !w-3 !h-3"
            />
            {editingOptionId === option.id ? (
              <input
                type="text"
                value={editingOptionLabel}
                onChange={(e) => setEditingOptionLabel(e.target.value)}
                onBlur={() => {
                  if (editingOptionLabel.trim()) {
                    handleUpdateOptionLabel(option.id, editingOptionLabel);
                  }
                  setEditingOptionId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (editingOptionLabel.trim()) {
                      handleUpdateOptionLabel(option.id, editingOptionLabel);
                    }
                    setEditingOptionId(null);
                  }
                }}
                autoFocus
                className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <button
                onClick={() => {
                  setEditingOptionId(option.id);
                  setEditingOptionLabel(option.label);
                }}
                className="flex-1 rounded border border-border px-2 py-1 text-xs text-left hover:bg-muted/30"
              >
                {option.label}
              </button>
            )}
            <button
              onClick={() => handleDeleteOption(option.id)}
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

      {/* Delete node button */}
      <button
        onClick={data.onDelete}
        className="w-full rounded bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20"
      >
        Excluir nó
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

function WhatsAppEmulator({
  flowState,
}: {
  flowState: FlowState;
}) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(
    flowState.startNodeId
  );
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);

  // Initialize: show first bot message
  const handleInitialize = () => {
    const startNode = flowState.nodes.find((n) => n.id === flowState.startNodeId);
    if (startNode) {
      setCurrentNodeId(startNode.id);
      setConversation([{ type: "bot", text: startNode.text }]);
    }
  };

  const handleOptionClick = (label: string, nextNodeId: string | null) => {
    // Add user message
    const newConversation: ConversationTurn[] = [
      ...conversation,
      { type: "user", label },
    ];

    if (nextNodeId) {
      const nextNode = flowState.nodes.find((n) => n.id === nextNodeId);
      if (nextNode) {
        newConversation.push({ type: "bot", text: nextNode.text });
        setConversation(newConversation);
        setCurrentNodeId(nextNodeId);
        return;
      }
    }

    // End of flow
    setConversation(newConversation);
    setCurrentNodeId(null);
  };

  const currentNode = flowState.nodes.find((n) => n.id === currentNodeId);

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
            {currentNode && currentNode.options.length > 0 && (
              <div className="mt-4 space-y-2">
                {currentNode.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option.label, option.next)}
                    className="w-full rounded-full border-2 border-emerald-600 px-4 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* End message */}
            {currentNode === undefined && conversation.length > 0 && (
              <div className="flex justify-start mt-4">
                <div className="bg-gray-200 text-gray-900 rounded-2xl px-4 py-2 text-sm">
                  Fim da conversa. Clique abaixo para reiniciar.
                </div>
              </div>
            )}

            {currentNode === undefined && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    setConversation([]);
                    setCurrentNodeId(null);
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

interface FlowBuilderProps {
  flowState: FlowState;
  onUpdate: (flowState: FlowState) => void;
}

function FlowBuilder({ flowState, onUpdate }: FlowBuilderProps) {
  // Convert FlowNodes to ReactFlow nodes with positions
  const initialRfNodes: Node[] = flowState.nodes.map((node, idx) => ({
    id: node.id,
    data: {
      label: node.text,
      node,
      onUpdate: (updatedNode: FlowNode) => {
        onUpdate({
          ...flowState,
          nodes: flowState.nodes.map((n) =>
            n.id === updatedNode.id ? updatedNode : n
          ),
        });
      },
      onDelete: () => {
        // Remove node and its edges
        onUpdate({
          ...flowState,
          nodes: flowState.nodes.filter((n) => n.id !== node.id),
        });
      },
    },
    position: { x: idx * 350, y: idx * 100 },
    type: "messageNode",
  }));

  // Convert options to edges
  const initialRfEdges: Edge[] = [];
  flowState.nodes.forEach((node) => {
    node.options.forEach((option) => {
      if (option.next) {
        initialRfEdges.push({
          id: `edge-${option.id}`,
          source: node.id,
          sourceHandle: option.id,
          target: option.next,
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

      // Update flow state: find source option and set its next target
      if (connection.sourceHandle) {
        const sourceNode = flowState.nodes.find(
          (n) => n.id === connection.source
        );
        if (sourceNode) {
          const updatedNode = {
            ...sourceNode,
            options: sourceNode.options.map((opt) =>
              opt.id === connection.sourceHandle
                ? { ...opt, next: connection.target || null }
                : opt
            ),
          };
          onUpdate({
            ...flowState,
            nodes: flowState.nodes.map((n) =>
              n.id === sourceNode.id ? updatedNode : n
            ),
          });
        }
      }
    },
    [edges, flowState, onUpdate, setEdges]
  );

  const handleAddNode = () => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: "message",
      text: "Nova pergunta?",
      options: [],
    };
    onUpdate({
      ...flowState,
      nodes: [...flowState.nodes, newNode],
    });
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-md">
        <button
          onClick={handleAddNode}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          title="Adicionar novo nó"
        >
          <Plus size={14} />
          Novo nó
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={{ messageNode: MessageNode }}
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

type Tab = "flow" | "templates";

export function BotMenuPage() {
  const [activeTab, setActiveTab] = useState<Tab>("flow");
  const [flowState, setFlowState] = useState<FlowState>(INITIAL_FLOW_STATE);
  const [templates, setTemplates] = useState<BotTemplate[]>(INITIAL_TEMPLATES);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] =
    useState<BotTemplate | null>(null);

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
            { key: "flow" as const, label: "Fluxo de Menu", icon: <GitBranch size={14} /> },
            { key: "templates" as const, label: "Templates", icon: <FileText size={14} /> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
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
        {activeTab === "flow" ? (
          <div className="flex gap-6 h-full">
            {/* Left: WhatsApp Emulator */}
            <div className="w-[35%]">
              <WhatsAppEmulator flowState={flowState} />
            </div>

            {/* Right: Flow Builder */}
            <div className="flex-1">
              <FlowBuilder flowState={flowState} onUpdate={setFlowState} />
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
